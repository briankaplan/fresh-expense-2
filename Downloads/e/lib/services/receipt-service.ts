import { prisma } from '@/lib/db'
import { SearchParams, Receipt } from '@/types'
import { GmailAccountManager } from '@/lib/gmail/accounts'

export class ReceiptService {
  private gmailManager: GmailAccountManager

  constructor() {
    this.gmailManager = new GmailAccountManager()
  }

  async searchReceipts(userId: string, params: SearchParams): Promise<Receipt[]> {
    const { query, startDate, endDate, category, page = 1, limit = 10 } = params

    return prisma.receipt.findMany({
      where: {
        userId,
        ...(query && {
          OR: [
            { merchant: { contains: query, mode: 'insensitive' } },
            { fileName: { contains: query, mode: 'insensitive' } }
          ]
        }),
        ...(startDate && { date: { gte: new Date(startDate) } }),
        ...(endDate && { date: { lte: new Date(endDate) } }),
        ...(category && { category })
      },
      include: {
        statementEntry: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' }
    })
  }

  async findMissingReceipts(userId: string, days: number = 30) {
    const missingEntries = await prisma.statementEntry.findMany({
      where: {
        userId,
        receipt: null,
        date: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'desc' }
    })

    // Try to find matches in Gmail
    const gmailMatches = await this.gmailManager.findMissingReceipts(
      userId,
      missingEntries
    )

    return {
      missingEntries,
      potentialMatches: gmailMatches
    }
  }
} 