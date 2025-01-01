import { PDFDocument } from 'pdf-lib'
import { mindee } from 'mindee'
import { EmailReceipt, ParsedReceipt } from './types'
import { extractReceiptData } from '../cloudflare'

export class ReceiptParser {
  private mindeeClient: any

  constructor() {
    this.mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY })
  }

  async parseReceipt(receipt: EmailReceipt): Promise<ParsedReceipt[]> {
    const results: ParsedReceipt[] = []

    // Try to parse the email body first
    const bodyResult = await this.parseEmailBody(receipt.body)
    if (bodyResult) results.push(bodyResult)

    // Process attachments
    for (const attachment of receipt.attachments) {
      const attachmentResult = await this.parseAttachment(attachment)
      if (attachmentResult) results.push(attachmentResult)
    }

    // Remove duplicates and sort by confidence
    return this.deduplicateResults(results)
  }

  private async parseEmailBody(body: string): Promise<ParsedReceipt | null> {
    try {
      // Remove HTML if present
      const plainText = body.replace(/<[^>]*>/g, ' ')

      // Use Cloudflare AI for initial text analysis
      const cloudflareResult = await extractReceiptData(plainText)

      // Use Mindee for structured data extraction
      const mindeeResult = await this.mindeeClient.parseText(
        'expense_receipts',
        plainText
      )

      return this.combineResults(mindeeResult, cloudflareResult, {
        type: 'text',
        format: 'email',
        raw: plainText
      })
    } catch (error) {
      console.error('Error parsing email body:', error)
      return null
    }
  }

  private async parseAttachment(attachment: any): Promise<ParsedReceipt | null> {
    try {
      const { filename, contentType, data } = attachment

      if (contentType.includes('pdf')) {
        return await this.parsePDF(data)
      } else if (contentType.includes('image')) {
        return await this.parseImage(data)
      }

      return null
    } catch (error) {
      console.error('Error parsing attachment:', error)
      return null
    }
  }

  private async parsePDF(data: Buffer): Promise<ParsedReceipt | null> {
    try {
      // First try direct Mindee PDF parsing
      const mindeeResult = await this.mindeeClient.parse(
        'expense_receipts',
        data,
        { filename: 'receipt.pdf' }
      )

      if (mindeeResult.prediction.probability > 0.7) {
        return this.processMindeeResult(mindeeResult, {
          type: 'pdf',
          format: 'mindee_direct',
          raw: ''
        })
      }

      // If Mindee confidence is low, try extracting text and images
      const pdfDoc = await PDFDocument.load(data)
      const pages = pdfDoc.getPages()
      const textContent = []

      for (const page of pages) {
        const text = await page.extractText()
        textContent.push(text)

        // Extract and process images if text extraction fails
        if (!text.trim()) {
          const images = await this.extractImagesFromPDF(page)
          for (const image of images) {
            const imageResult = await this.parseImage(image)
            if (imageResult && imageResult.confidence > 0.7) {
              return imageResult
            }
          }
        }
      }

      // Process extracted text
      const combinedText = textContent.join('\n')
      if (combinedText.trim()) {
        return this.parseEmailBody(combinedText)
      }

      return null
    } catch (error) {
      console.error('Error parsing PDF:', error)
      return null
    }
  }

  private async parseImage(data: Buffer): Promise<ParsedReceipt | null> {
    try {
      // Use Mindee for image OCR and data extraction
      const mindeeResult = await this.mindeeClient.parse(
        'expense_receipts',
        data,
        { filename: 'receipt.jpg' }
      )

      // Use Cloudflare as backup/verification
      const cloudflareResult = await extractReceiptData(
        mindeeResult.document.inference.ocr.text
      )

      return this.combineResults(mindeeResult, cloudflareResult, {
        type: 'image',
        format: 'mindee_ocr',
        raw: mindeeResult.document.inference.ocr.text
      })
    } catch (error) {
      console.error('Error parsing image:', error)
      return null
    }
  }

  private combineResults(mindeeResult: any, cloudflareResult: any, source: any): ParsedReceipt {
    // Prefer Mindee's structured data but use Cloudflare for verification
    const mindeeData = mindeeResult.prediction
    const confidence = Math.max(
      mindeeData.probability,
      cloudflareResult.metadata.confidence
    )

    return {
      amount: mindeeData.total.value || cloudflareResult.transaction.total,
      date: new Date(mindeeData.date.value || cloudflareResult.transaction.date),
      merchant: mindeeData.supplier.value || cloudflareResult.merchant.name,
      items: mindeeData.lineItems.map(item => ({
        description: item.description,
        amount: item.totalAmount,
        quantity: item.quantity
      })),
      confidence,
      source: {
        ...source,
        mindeeConfidence: mindeeData.probability,
        cloudflareConfidence: cloudflareResult.metadata.confidence
      }
    }
  }

  private processMindeeResult(result: any, source: any): ParsedReceipt {
    const prediction = result.prediction
    return {
      amount: prediction.total.value,
      date: new Date(prediction.date.value),
      merchant: prediction.supplier.value,
      items: prediction.lineItems.map(item => ({
        description: item.description,
        amount: item.totalAmount,
        quantity: item.quantity
      })),
      confidence: prediction.probability,
      source: {
        ...source,
        mindeeConfidence: prediction.probability
      }
    }
  }

  private deduplicateResults(results: ParsedReceipt[]): ParsedReceipt[] {
    const seen = new Map<string, ParsedReceipt>()

    for (const result of results) {
      const key = this.generateReceiptKey(result)
      const existing = seen.get(key)

      if (!existing || existing.confidence < result.confidence) {
        seen.set(key, result)
      }
    }

    return Array.from(seen.values())
      .sort((a, b) => b.confidence - a.confidence)
  }

  private generateReceiptKey(receipt: ParsedReceipt): string {
    // Create a unique key based on core receipt data
    const date = receipt.date.toISOString().split('T')[0] // Use date only
    const amount = receipt.amount.toFixed(2)
    const merchant = receipt.merchant.toLowerCase().replace(/[^a-z0-9]/g, '')
    return `${merchant}-${amount}-${date}`
  }
} 