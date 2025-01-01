import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/db'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state') // Pass userId in state

  if (!code || !userId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    await prisma.userCredentials.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiryDate: tokens.expiry_date!
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiryDate: tokens.expiry_date!
      }
    })

    return NextResponse.redirect('/settings/integrations')
  } catch (error) {
    console.error('Gmail auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
} 