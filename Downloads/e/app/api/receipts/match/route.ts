import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { receiptId, statementEntryId } = await request.json()

    // Verify both IDs exist
    const [receipt, statementEntry] = await Promise.all([
      prisma.receipt.findUnique({ where: { id: receiptId } }),
      prisma.statementEntry.findUnique({ where: { id: statementEntryId } })
    ])

    if (!receipt || !statementEntry) {
      return NextResponse.json(
        { error: 'Receipt or statement entry not found' },
        { status: 404 }
      )
    }

    // Update the receipt with the new statement entry link
    const updatedReceipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: { statementEntryId },
      include: {
        statementEntry: true
      }
    })

    return NextResponse.json({
      message: 'Receipt matched successfully',
      receipt: updatedReceipt
    })
  } catch (error) {
    console.error('Receipt matching error:', error)
    return NextResponse.json(
      { error: 'Error matching receipt' },
      { status: 500 }
    )
  }
} 