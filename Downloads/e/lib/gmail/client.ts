import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GmailCredentials, EmailReceipt } from './types'
import { prisma } from '@/lib/db'

export class GmailClient {
  private oauth2Client: OAuth2Client

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  async authorize(userId: string) {
    const credentials = await prisma.userCredentials.findUnique({
      where: { userId }
    })

    if (!credentials) {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.modify'
        ]
      })
      return { needsAuth: true, authUrl }
    }

    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiryDate
    })

    return { needsAuth: false }
  }

  async searchReceipts(query: {
    startDate: Date
    endDate: Date
    merchant?: string
    amount?: number
  }): Promise<EmailReceipt[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    
    // Build search query
    let searchQuery = `after:${query.startDate.toISOString()} before:${query.endDate.toISOString()} `
    searchQuery += 'subject:(receipt OR confirmation OR order) '
    if (query.merchant) {
      searchQuery += `from:${query.merchant} `
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 100
    })

    const receipts: EmailReceipt[] = []
    for (const message of response.data.messages || []) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full'
      })

      const receipt = await this.parseEmailReceipt(details.data)
      if (receipt) receipts.push(receipt)
    }

    return receipts
  }

  private async parseEmailReceipt(message: any): Promise<EmailReceipt | null> {
    try {
      const headers = message.payload.headers
      const subject = headers.find((h: any) => h.name === 'Subject')?.value
      const from = headers.find((h: any) => h.name === 'From')?.value
      const date = new Date(headers.find((h: any) => h.name === 'Date')?.value)

      // Extract body
      const body = this.getEmailBody(message.payload)

      // Get attachments
      const attachments = await this.getAttachments(message.id, message.payload)

      return {
        messageId: message.id,
        subject,
        from,
        date,
        body,
        attachments
      }
    } catch (error) {
      console.error('Error parsing email receipt:', error)
      return null
    }
  }

  private getEmailBody(payload: any): string {
    if (payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString()
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          return Buffer.from(part.body.data, 'base64').toString()
        }
      }
    }

    return ''
  }

  private async getAttachments(messageId: string, payload: any) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    const attachments = []

    const processPayloadParts = async (parts: any[]) => {
      for (const part of parts) {
        if (part.filename && part.body.attachmentId) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId,
            id: part.body.attachmentId
          })

          attachments.push({
            filename: part.filename,
            contentType: part.mimeType,
            data: Buffer.from(attachment.data.data!, 'base64')
          })
        }

        if (part.parts) {
          await processPayloadParts(part.parts)
        }
      }
    }

    if (payload.parts) {
      await processPayloadParts(payload.parts)
    }

    return attachments
  }
} 