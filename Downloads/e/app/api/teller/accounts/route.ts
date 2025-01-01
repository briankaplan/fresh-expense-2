import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AccountSyncService } from '@/lib/services/account-sync-service'

const accountSync = new AccountSyncService()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const accounts = await prisma.tellerAccount.findMany({
      where: {
        connection: {
          userId,
          status: 'active'
        }
      },
      include: {
        connection: {
          select: {
            institutionId: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
} 