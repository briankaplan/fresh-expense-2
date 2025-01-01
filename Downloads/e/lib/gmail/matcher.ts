import { GmailClient } from './client'
import { BankCharge, EmailReceipt } from './types'
import { queueMatching } from '../matching/queue'
import { uploadFile } from '@/lib/storage'
import { prisma } from '@/lib/db'

export class ReceiptMatcher {
  private gmail: GmailClient

  constructor() {
    this.gmail = new GmailClient()
  }

  async matchBankCharges(userId: string, charges: BankCharge[]) {
    // Authorize Gmail access
    const auth = await this.gmail.authorize(userId)
    if (auth.needsAuth) {
      return { needsAuth: true, authUrl: auth.authUrl }
    }

    for (const charge of charges) {
      await this.findMatchingReceipt(charge)
    }
  }

  private async findMatchingReceipt(charge: BankCharge) {
    // Search for receipts around the charge date
    const searchWindow = {
      startDate: new Date(charge.date.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
      endDate: new Date(charge.date.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after
      merchant: charge.merchant
    }

    const receipts = await this.gmail.searchReceipts(searchWindow)
    const matches = await this.analyzeMatches(charge, receipts)

    if (matches.length > 0) {
      // Process the best match
      const bestMatch = matches[0]
      await this.processMatch(charge, bestMatch)
    }
  }

  private async analyzeMatches(charge: BankCharge, receipts: EmailReceipt[]) {
    const matches = []

    for (const receipt of receipts) {
      const score = this.calculateMatchScore(charge, receipt)
      if (score > 0.7) { // Minimum confidence threshold
        matches.push({ receipt, score })
      }
    }

    return matches.sort((a, b) => b.score - a.score)
  }

  private calculateMatchScore(charge: BankCharge, receipt: EmailReceipt): number {
    let score = 0

    // Date proximity (max 0.3)
    const daysDiff = Math.abs(charge.date.getTime() - receipt.date.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 0.3 - (daysDiff * 0.1))

    // Merchant name matching (max 0.4)
    const merchantScore = this.calculateMerchantSimilarity(charge.merchant, receipt.from)
    score += merchantScore * 0.4

    // Amount detection in email body (max 0.3)
    if (this.findAmountInEmail(charge.amount, receipt.body)) {
      score += 0.3
    }

    return score
  }

  private async processMatch(charge: BankCharge, match: { receipt: EmailReceipt; score: number }) {
    // Upload any attachments
    const attachmentUrls = []
    for (const attachment of match.receipt.attachments) {
      if (this.isReceiptFile(attachment.filename)) {
        const fileUrl = await uploadFile(attachment.data, 'receipts')
        attachmentUrls.push(fileUrl)
      }
    }

    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        fileName: match.receipt.subject,
        fileUrl: attachmentUrls[0], // Use first attachment if available
        emailMessageId: match.receipt.messageId,
        merchant: charge.merchant,
        amount: charge.amount,
        date: charge.date,
        matchConfidence: match.score,
        status: 'pending',
        metadata: {
          emailSubject: match.receipt.subject,
          emailFrom: match.receipt.from,
          attachments: attachmentUrls
        }
      }
    })

    // Queue for processing
    await queueMatching({
      receiptId: receipt.id,
      priority: 2 // Higher priority for email matches
    })
  }

  private isReceiptFile(filename: string): boolean {
    const receiptExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
    return receiptExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  private findAmountInEmail(amount: number, body: string): boolean {
    // Convert amount to various formats
    const formats = [
      amount.toFixed(2),
      amount.toString(),
      `$${amount.toFixed(2)}`,
      `$${amount}`
    ]

    return formats.some(format => body.includes(format))
  }

  private calculateMerchantSimilarity(merchant1: string, merchant2: string): number {
    // Implement fuzzy string matching
    // Could use algorithms like Levenshtein distance
    return 0.8 // Placeholder
  }
} 