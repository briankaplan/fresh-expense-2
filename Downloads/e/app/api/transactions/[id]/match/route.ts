import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { receiptId } = await request.json()

    // Update the statement entry
    await prisma.statementEntry.update({
      where: { id: params.id },
      data: { matchStatus: 'matched' }
    })

    // Link the receipt
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { statementEntryId: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Failed to match receipt' }, { status: 500 })
  }
} 