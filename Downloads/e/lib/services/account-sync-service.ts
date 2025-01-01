import { prisma } from '@/lib/db'
import { TellerService } from './teller-service'
import { TransactionMatcher } from './transaction-matcher'

export class AccountSyncService {
  private tellerService: TellerService
  private transactionMatcher: TransactionMatcher

  constructor() {
    this.tellerService = new TellerService()
    this.transactionMatcher = new TransactionMatcher()
  }

  async syncAccounts(connectionId: string) {
    const connection = await prisma.tellerConnection.findUnique({
      where: { id: connectionId }
    })

    if (!connection) {
      throw new Error('Connection not found')
    }

    const accounts = await this.tellerService.getAccounts(connection.accessToken)

    // Update or create accounts
    for (const account of accounts) {
      await prisma.tellerAccount.upsert({
        where: { id: account.id },
        update: {
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          status: account.status,
          lastFour: account.last_four,
          institution: account.institution.name,
          balance: account.balance.current,
          currency: account.currency,
        },
        create: {
          id: account.id,
          connectionId: connection.id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          status: account.status,
          lastFour: account.last_four,
          institution: account.institution.name,
          balance: account.balance.current,
          currency: account.currency,
        },
      })
    }

    return accounts
  }

  async syncTransactions(accountId: string) {
    const account = await prisma.tellerAccount.findUnique({
      where: { id: accountId },
      include: { connection: true }
    })

    if (!account || !account.connection) {
      throw new Error('Account not found')
    }

    const transactions = await this.tellerService.getTransactions(
      account.connection.accessToken,
      accountId
    )

    // Create statement entries from transactions
    for (const transaction of transactions) {
      // Try to find matching receipt
      const matchingReceipt = await this.transactionMatcher.findMatchingReceipt(transaction)

      const entry = await prisma.statementEntry.create({
        data: {
          date: new Date(transaction.date),
          amount: transaction.amount,
          description: transaction.description,
          statementId: 'teller',
          matchStatus: matchingReceipt ? 'matched' : 'pending',
          matchAttempts: 0,
        }
      })

      // If we found a match, link it
      if (matchingReceipt) {
        await prisma.receipt.update({
          where: { id: matchingReceipt.id },
          data: { statementEntryId: entry.id }
        })
      }
    }

    return transactions
  }
} 