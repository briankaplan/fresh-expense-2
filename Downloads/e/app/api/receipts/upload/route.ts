import { NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'
import { prisma } from '@/lib/db'
import { processReceipt } from '@/lib/ocr'
import { findMatchingStatementEntry } from '@/lib/matching'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG and PDF files are allowed' },
        { status: 400 }
      )
    }

    // Upload to S3
    const fileUrl = await uploadFile(file, 'receipts')

    // Create initial receipt record with pending status
    let receipt = await prisma.receipt.create({
      data: {
        fileName: file.name,
        fileUrl,
        status: 'pending',
      }
    })

    // Process receipt with Mindee OCR
    const receiptData = await processReceipt(fileUrl)

    // Try to find matching statement entry
    const matches = await findMatchingStatementEntry({
      amount: receiptData.amount,
      date: receiptData.date || new Date(),
      merchant: receiptData.merchant,
    }, prisma)

    // Update receipt with extracted data and matching
    receipt = await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        status: 'processed',
        merchant: receiptData.merchant,
        date: receiptData.date,
        amount: receiptData.amount,
        items: receiptData.items,
        taxAmount: receiptData.taxAmount,
        currency: receiptData.currency,
        confidence: receiptData.metadata.confidence,
        locale: receiptData.metadata.locale,
        paymentMethod: receiptData.metadata.paymentMethod,
        processedAt: new Date(),
        // Link to matching statement entry if found
        statementEntryId: matches[0]?.id
      }
    })

    return NextResponse.json({
      message: 'Receipt uploaded and processed successfully',
      receipt: {
        id: receipt.id,
        fileName: receipt.fileName,
        merchant: receipt.merchant,
        amount: receipt.amount,
        date: receipt.date,
        status: receipt.status,
        matchFound: !!matches.length
      },
      matches: matches.length ? matches : undefined
    })
  } catch (error) {
    console.error('Receipt upload error:', error)
    return NextResponse.json(
      { error: 'Error processing receipt' },
      { status: 500 }
    )
  }
} 