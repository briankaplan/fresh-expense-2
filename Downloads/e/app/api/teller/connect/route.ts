import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { accountNumber, routingNumber } = await request.json()

    // Validate input
    if (!accountNumber || !routingNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a simulated enrollment
    const enrollmentId = `enr_${Math.random().toString(36).substring(2, 15)}`

    // Create connection record
    const connection = await prisma.tellerConnection.create({
      data: {
        userId: 'test-user', // Replace with actual user ID
        accessToken: 'test_token', // In production, this would come from Teller
        enrollmentId,
        institutionId: 'test_bank',
        status: 'active',
      },
    })

    // Create account record
    await prisma.tellerAccount.create({
      data: {
        id: `acc_${Math.random().toString(36).substring(2, 15)}`,
        connectionId: connection.id,
        name: 'Test Account',
        type: 'checking',
        status: 'active',
        lastFour: accountNumber.slice(-4),
        institution: 'Test Bank',
        balance: 0,
      },
    })

    return NextResponse.json({ 
      success: true,
      enrollmentId,
    })
  } catch (error) {
    console.error('Connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect account' },
      { status: 500 }
    )
  }
} 