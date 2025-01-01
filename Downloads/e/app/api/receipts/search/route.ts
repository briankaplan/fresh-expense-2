import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TransactionMatcher } from '@/lib/services/transaction-matcher'

const matcher = new TransactionMatcher()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const amount = parseFloat(searchParams.get('amount') || '0')
  const date = new Date(searchParams.get('date') || '')

  if (isNaN(amount) || isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const receipts = await prisma.receipt.findMany({
      where: {
        date: {
          gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
          lte: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after
        },
        amount: {
          gte: amount * 0.95,
          lte: amount * 1.05,
        },
        statementEntryId: null, // Only unmatched receipts
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ receipts })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search receipts' }, { status: 500 })
  }
} 