import { prisma } from '@/lib/db'

export class TransactionMatcher {
  private readonly MATCH_THRESHOLD = 0.8
  private readonly DATE_THRESHOLD = 7 // days

  async findMatchingReceipt(transaction: any) {
    const transactionDate = new Date(transaction.date)
    const minDate = new Date(transactionDate)
    minDate.setDate(minDate.getDate() - this.DATE_THRESHOLD)
    const maxDate = new Date(transactionDate)
    maxDate.setDate(maxDate.getDate() + this.DATE_THRESHOLD)

    // Find receipts within date range and similar amount
    const potentialMatches = await prisma.receipt.findMany({
      where: {
        date: {
          gte: minDate,
          lte: maxDate,
        },
        amount: {
          gte: transaction.amount * 0.95, // Allow 5% variance
          lte: transaction.amount * 1.05,
        },
        statementEntryId: null, // Only unmatched receipts
      },
    })

    if (potentialMatches.length === 0) {
      return null
    }

    // Score matches based on date proximity and amount similarity
    const scoredMatches = potentialMatches.map(receipt => {
      const dateScore = this.calculateDateScore(transactionDate, receipt.date!)
      const amountScore = this.calculateAmountScore(transaction.amount, receipt.amount!)
      const merchantScore = this.calculateMerchantScore(transaction.description, receipt.merchant!)
      
      const totalScore = (dateScore + amountScore + merchantScore) / 3

      return {
        receipt,
        score: totalScore
      }
    })

    // Sort by score and get best match
    const bestMatch = scoredMatches.sort((a, b) => b.score - a.score)[0]

    return bestMatch.score >= this.MATCH_THRESHOLD ? bestMatch.receipt : null
  }

  private calculateDateScore(date1: Date, date2: Date): number {
    const diffDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, 1 - (diffDays / this.DATE_THRESHOLD))
  }

  private calculateAmountScore(amount1: number, amount2: number): number {
    const diff = Math.abs(amount1 - amount2)
    const maxAmount = Math.max(amount1, amount2)
    return Math.max(0, 1 - (diff / maxAmount))
  }

  private calculateMerchantScore(description: string, merchant: string): number {
    const words1 = description.toLowerCase().split(/\W+/)
    const words2 = merchant.toLowerCase().split(/\W+/)
    
    const commonWords = words1.filter(word => words2.includes(word))
    return commonWords.length / Math.max(words1.length, words2.length)
  }
} 