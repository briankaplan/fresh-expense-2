import { prisma } from '@/lib/db'
import { AccountSyncService } from './account-sync-service'
import { TransactionMatcher } from './transaction-matcher'
import { ExpenseSyncService } from './expense-sync-service'

export class SyncService {
  private accountSync: AccountSyncService
  private matcher: TransactionMatcher
  private expenseSync: ExpenseSyncService

  constructor() {
    this.accountSync = new AccountSyncService()
    this.matcher = new TransactionMatcher()
    this.expenseSync = new ExpenseSyncService()
  }

  async syncAllAccounts() {
    const settings = await prisma.tellerSettings.findMany({
      where: { enabled: true, autoSync: true }
    })

    for (const setting of settings) {
      try {
        const connections = await prisma.tellerConnection.findMany({
          where: { 
            userId: setting.userId,
            status: 'active'
          },
          include: {
            accounts: true
          }
        })

        for (const connection of connections) {
          // Sync accounts first
          await this.accountSync.syncAccounts(connection.id)

          // Then sync transactions for each account
          for (const account of connection.accounts) {
            const transactions = await this.accountSync.syncTransactions(account.id)
            console.log(`Synced ${transactions.length} transactions for account ${account.id}`)
          }

          // After syncing transactions, sync expenses
          await this.expenseSync.syncAllPendingTransactions()
        }
      } catch (error) {
        console.error(`Sync failed for user ${setting.userId}:`, error)
      }
    }
  }
} 