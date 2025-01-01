import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GmailAccountManager } from '@/lib/gmail/accounts'

export async function POST(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const account = await prisma.gmailAccount.findUnique({
      where: { id: params.accountId }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const manager = new GmailAccountManager()
    await manager.syncAccount(account)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing account:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
} 