import { NextResponse } from 'next/server'
import { ExpenseSyncService } from '@/lib/services/expense-sync-service'

const expenseSync = new ExpenseSyncService()

export async function POST() {
  try {
    const expenses = await expenseSync.syncAllPendingTransactions()
    return NextResponse.json({ 
      success: true,
      syncedCount: expenses.length
    })
  } catch (error) {
    console.error('Expense sync error:', error)
    return NextResponse.json({ error: 'Failed to sync expenses' }, { status: 500 })
  }
} 