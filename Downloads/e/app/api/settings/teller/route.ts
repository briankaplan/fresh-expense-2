import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.tellerSettings.findFirst({
      where: { userId: 'test-user' } // Replace with actual user ID
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const settings = await prisma.tellerSettings.upsert({
      where: { userId: 'test-user' }, // Replace with actual user ID
      update: data,
      create: {
        userId: 'test-user',
        ...data
      }
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
} 