import { prisma } from '@/lib/db'

interface ExpenseData {
  date: Date
  amount: number
  description: string
  category?: string
  merchant?: string
  source: 'teller' | 'manual'
  sourceId: string
  metadata?: any
}

export class ExpenseSyncService {
  async syncTransactionToExpense(transactionId: string) {
    const transaction = await prisma.statementEntry.findUnique({
      where: { id: transactionId },
      include: {
        receipt: true,
      }
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // Only sync expenses (negative amounts)
    if (transaction.amount >= 0) {
      return null
    }

    const expenseData: ExpenseData = {
      date: transaction.date,
      amount: Math.abs(transaction.amount), // Convert to positive for expense
      description: transaction.description,
      category: transaction.category,
      merchant: transaction.receipt?.merchant,
      source: 'teller',
      sourceId: transaction.id,
      metadata: {
        hasReceipt: !!transaction.receipt,
        receiptId: transaction.receipt?.id,
        matchStatus: transaction.matchStatus,
      }
    }

    // Create or update expense
    const expense = await prisma.expense.upsert({
      where: {
        sourceId_source: {
          sourceId: transaction.id,
          source: 'teller'
        }
      },
      update: expenseData,
      create: expenseData
    })

    return expense
  }

  async syncAllPendingTransactions() {
    const transactions = await prisma.statementEntry.findMany({
      where: {
        amount: { lt: 0 }, // Only negative amounts (expenses)
        expense: null, // Only transactions not yet synced to expenses
      }
    })

    const results = await Promise.all(
      transactions.map(transaction => 
        this.syncTransactionToExpense(transaction.id)
          .catch(error => {
            console.error(`Failed to sync transaction ${transaction.id}:`, error)
            return null
          })
      )
    )

    return results.filter(Boolean)
  }
} 