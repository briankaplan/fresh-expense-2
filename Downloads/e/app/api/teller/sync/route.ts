import { NextResponse } from 'next/server'
import { TransactionSyncService } from '@/lib/services/transaction-sync'

const syncService = new TransactionSyncService()

export async function POST(request: Request) {
  try {
    const results = await syncService.syncAllAccounts()
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
} 