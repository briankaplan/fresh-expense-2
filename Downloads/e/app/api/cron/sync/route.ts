import { NextResponse } from 'next/server'
import { SyncService } from '@/lib/services/sync-service'

const syncService = new SyncService()

export async function GET(request: Request) {
  try {
    await syncService.syncAllAccounts()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
} 