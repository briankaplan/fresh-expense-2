import { prisma } from '@/lib/db'

interface TellerTransaction {
  id: string
  account_id: string
  date: string
  amount: number
  description: string
  status: string
  details: {
    category?: string
    counterparty?: string
    processing_status: string
  }
}

export class TransactionSyncService {
  async syncTransactions(accountId: string, accessToken: string) {
    try {
      // Fetch transactions from Teller API
      const response = await fetch(`https://api.teller.io/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const transactions: TellerTransaction[] = await response.json()

      // Process each transaction
      const results = await Promise.all(
        transactions.map(async (transaction) => {
          try {
            // Create or update statement entry
            const entry = await prisma.statementEntry.upsert({
              where: {
                sourceId_source: {
                  sourceId: transaction.id,
                  source: 'teller'
                }
              },
              update: {
                date: new Date(transaction.date),
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.details.category,
                metadata: {
                  status: transaction.status,
                  processingStatus: transaction.details.processing_status,
                  counterparty: transaction.details.counterparty,
                }
              },
              create: {
                sourceId: transaction.id,
                source: 'teller',
                date: new Date(transaction.date),
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.details.category,
                statementId: 'teller', // You might want to handle this differently
                matchStatus: 'pending',
                matchAttempts: 0,
                metadata: {
                  status: transaction.status,
                  processingStatus: transaction.details.processing_status,
                  counterparty: transaction.details.counterparty,
                }
              }
            })

            // If it's an expense (negative amount), sync to expenses
            if (transaction.amount < 0) {
              await prisma.expense.upsert({
                where: {
                  sourceId_source: {
                    sourceId: transaction.id,
                    source: 'teller'
                  }
                },
                update: {
                  date: new Date(transaction.date),
                  amount: Math.abs(transaction.amount),
                  description: transaction.description,
                  category: transaction.details.category,
                  merchant: transaction.details.counterparty,
                  metadata: {
                    status: transaction.status,
                    processingStatus: transaction.details.processing_status,
                  }
                },
                create: {
                  sourceId: transaction.id,
                  source: 'teller',
                  date: new Date(transaction.date),
                  amount: Math.abs(transaction.amount),
                  description: transaction.description,
                  category: transaction.details.category,
                  merchant: transaction.details.counterparty,
                  metadata: {
                    status: transaction.status,
                    processingStatus: transaction.details.processing_status,
                  }
                }
              })
            }

            return entry
          } catch (error) {
            console.error(`Failed to sync transaction ${transaction.id}:`, error)
            return null
          }
        })
      )

      return results.filter(Boolean)
    } catch (error) {
      console.error(`Failed to sync transactions for account ${accountId}:`, error)
      throw error
    }
  }

  async syncAllAccounts() {
    const accounts = await prisma.tellerAccount.findMany({
      where: {
        connection: {
          status: 'active'
        }
      },
      include: {
        connection: true
      }
    })

    const results = await Promise.all(
      accounts.map(async (account) => {
        try {
          const transactions = await this.syncTransactions(
            account.id,
            account.connection.accessToken
          )
          return {
            accountId: account.id,
            syncedCount: transactions.length,
            success: true
          }
        } catch (error) {
          console.error(`Failed to sync account ${account.id}:`, error)
          return {
            accountId: account.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          }
        }
      })
    )

    return results
  }
} 