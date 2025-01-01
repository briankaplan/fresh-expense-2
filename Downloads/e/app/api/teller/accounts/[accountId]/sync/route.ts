import { NextResponse } from 'next/server'
import { AccountSyncService } from '@/lib/services/account-sync-service'

const accountSync = new AccountSyncService()

export async function POST(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const transactions = await accountSync.syncTransactions(params.accountId)
    return NextResponse.json({ 
      success: true, 
      transactionCount: transactions.length 
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Failed to sync transactions' }, { status: 500 })
  }
} 