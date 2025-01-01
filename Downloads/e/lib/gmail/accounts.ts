import { prisma } from '@/lib/db'
import { GmailClient } from './client'
import { ReceiptMatcher } from './matcher'
import { GmailAccount } from './types'

export class GmailAccountManager {
  async listAccounts(userId: string): Promise<GmailAccount[]> {
    return prisma.gmailAccount.findMany({
      where: { userId }
    })
  }

  async addAccount(userId: string, authCode: string) {
    const client = new GmailClient()
    const tokens = await client.getTokensFromCode(authCode)
    const userInfo = await client.getUserInfo(tokens.access_token)

    return prisma.gmailAccount.create({
      data: {
        userId,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        isActive: true,
        lastSync: new Date()
      }
    })
  }

  async syncAllAccounts(userId: string) {
    const accounts = await this.listAccounts(userId)
    const results = []

    for (const account of accounts) {
      if (!account.isActive) continue

      try {
        const client = new GmailClient(account)
        const matcher = new ReceiptMatcher(client)
        
        // Get recent bank charges
        const charges = await prisma.statementEntry.findMany({
          where: {
            userId,
            receipt: null,
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })

        // Match receipts for each charge
        const matchResults = await matcher.matchBankCharges(charges)
        results.push({
          account: account.email,
          matches: matchResults
        })

        // Update last sync time
        await prisma.gmailAccount.update({
          where: { id: account.id },
          data: { lastSync: new Date() }
        })
      } catch (error) {
        console.error(`Error syncing account ${account.email}:`, error)
        results.push({
          account: account.email,
          error: error.message
        })
      }
    }

    return results
  }
} 