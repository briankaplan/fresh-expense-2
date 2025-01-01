import { Client, Receipt } from 'mindee'
import { extractReceiptData } from './cloudflare'
import { categorizeReceipt } from './categories'

const mindeeClient = new Client({ apiKey: process.env.MINDEE_API_KEY })

export interface ProcessedReceipt {
  merchant: string
  date: Date | null
  amount: number
  category: string
  taxAmount?: number
  currency?: string
  items?: Array<{
    description: string
    amount: number
    quantity?: number
    unitPrice?: number
  }>
  metadata: {
    confidence: number
    locale?: string
    paymentMethod?: string
    rawText?: string
    cloudflareConfidence?: number
    cloudflareClassification?: string
  }
}

export async function processReceipt(fileUrl: string): Promise<ProcessedReceipt> {
  try {
    // Process with both Mindee and Cloudflare in parallel
    const [mindeeResult, cloudflareResult] = await Promise.all([
      processMindeeReceipt(fileUrl),
      extractReceiptData(fileUrl)
    ])

    // Combine results, preferring Mindee's structured data but using Cloudflare for enhancement
    const merchant = mindeeResult.merchant || cloudflareResult.extracted.merchant
    const amount = mindeeResult.amount || cloudflareResult.extracted.amount
    const date = mindeeResult.date || new Date(cloudflareResult.extracted.date)

    // Merge line items
    const items = mergeLineItems(mindeeResult.items, cloudflareResult.extracted.items)

    // Determine category using combined data
    const category = await categorizeReceipt(
      merchant,
      items,
      cloudflareResult.classification
    )

    return {
      merchant,
      date,
      amount,
      category,
      taxAmount: mindeeResult.taxAmount,
      currency: mindeeResult.currency,
      items,
      metadata: {
        confidence: mindeeResult.metadata.confidence,
        locale: mindeeResult.metadata.locale,
        paymentMethod: mindeeResult.metadata.paymentMethod,
        rawText: cloudflareResult.rawText,
        cloudflareConfidence: cloudflareResult.confidence,
        cloudflareClassification: cloudflareResult.classification
      }
    }
  } catch (error) {
    console.error('Receipt processing error:', error)
    throw error
  }
}

async function processMindeeReceipt(fileUrl: string) {
  const inputDoc = await mindeeClient.loadDocument(fileUrl)
  const apiResponse = await inputDoc.parse(Receipt)
  const prediction = apiResponse.document

  return {
    merchant: prediction.merchantName?.value || '',
    date: prediction.date?.value ? new Date(prediction.date.value) : null,
    amount: prediction.totalAmount?.value || 0,
    taxAmount: prediction.totalTax?.value,
    currency: prediction.totalAmount?.currency,
    items: prediction.lineItems?.map(item => ({
      description: item.description || '',
      amount: item.totalAmount || 0,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    metadata: {
      confidence: prediction.merchantName?.confidence || 0,
      locale: prediction.locale,
      paymentMethod: prediction.paymentMethod
    }
  }
}

function mergeLineItems(mindeeItems: any[] = [], cloudflareItems: any[] = []) {
  // Create a map of descriptions to items
  const itemMap = new Map()

  // Add Mindee items
  mindeeItems.forEach(item => {
    itemMap.set(item.description.toLowerCase(), item)
  })

  // Merge or add Cloudflare items
  cloudflareItems.forEach(item => {
    const key = item.description.toLowerCase()
    if (itemMap.has(key)) {
      // Merge with existing item, taking the most complete data
      const existing = itemMap.get(key)
      itemMap.set(key, {
        ...existing,
        ...item,
        quantity: existing.quantity || item.quantity,
        unitPrice: existing.unitPrice || item.unitPrice
      })
    } else {
      itemMap.set(key, item)
    }
  })

  return Array.from(itemMap.values())
} 