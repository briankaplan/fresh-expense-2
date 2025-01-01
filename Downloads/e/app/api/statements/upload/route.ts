import { NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'
import { prisma } from '@/lib/db'

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

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Upload file to S3
    const fileUrl = await uploadFile(file, 'statements')

    // Save to database
    const statement = await prisma.statement.create({
      data: {
        fileName: file.name,
        fileUrl,
      }
    })

    return NextResponse.json({
      message: 'Statement uploaded successfully',
      statement: {
        id: statement.id,
        fileName: statement.fileName,
        uploadedAt: statement.uploadedAt,
      }
    })
  } catch (error) {
    console.error('Statement upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading statement' },
      { status: 500 }
    )
  }
} 