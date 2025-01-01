import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GmailAccountManager } from '@/lib/gmail/accounts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const accounts = await prisma.gmailAccount.findMany({
      where: { userId }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching Gmail accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) {
    return NextResponse.json({ error: 'Missing accountId' }, { status: 400 })
  }

  try {
    await prisma.gmailAccount.delete({
      where: { id: accountId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Gmail account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
} 