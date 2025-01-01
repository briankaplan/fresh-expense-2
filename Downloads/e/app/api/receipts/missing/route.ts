import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GmailAccountManager } from '@/lib/gmail/accounts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const days = parseInt(searchParams.get('days') || '30')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Find statement entries without receipts
    const missingReceipts = await prisma.statementEntry.findMany({
      where: {
        userId,
        receipt: null,
        date: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Try to find matching receipts in Gmail
    const accountManager = new GmailAccountManager()
    const searchResults = await accountManager.findMissingReceipts(
      userId,
      missingReceipts
    )

    return NextResponse.json({
      missing: missingReceipts,
      found: searchResults
    })
  } catch (error) {
    console.error('Missing receipts search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
} 