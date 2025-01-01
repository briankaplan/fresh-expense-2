import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { enrollmentId, institutionId, accessToken } = await request.json()

    // Create connection record
    const connection = await prisma.tellerConnection.create({
      data: {
        userId: 'test-user', // Replace with actual user ID
        accessToken,
        enrollmentId,
        institutionId,
        status: 'active',
      },
    })

    // Fetch accounts from Teller API
    const accountsResponse = await fetch('https://api.teller.io/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch accounts from Teller')
    }

    const accounts = await accountsResponse.json()

    // Create account records
    await Promise.all(accounts.map(async (account: any) => {
      await prisma.tellerAccount.create({
        data: {
          id: account.id,
          connectionId: connection.id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          status: account.status,
          lastFour: account.last_four,
          institution: account.institution.name,
          balance: account.balance.current,
          currency: account.currency,
        },
      })
    }))

    return NextResponse.json({ 
      success: true, 
      connectionId: connection.id 
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
} 