import { prisma } from '@/lib/db'

export class TellerService {
  private readonly applicationId: string
  private readonly environment: string
  private readonly baseUrl: string

  constructor() {
    this.applicationId = process.env.TELLER_APPLICATION_ID!
    this.environment = process.env.TELLER_ENVIRONMENT || 'sandbox'
    this.baseUrl = process.env.TELLER_API_URL || 'https://api.teller.io'
  }

  async getAccessToken(enrollmentId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/enrollment/${enrollmentId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.applicationId + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async getAccounts(accessToken: string) {
    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch accounts')
    }

    return response.json()
  }

  async getTransactions(accessToken: string, accountId: string) {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }

    return response.json()
  }
} 