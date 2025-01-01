export interface GmailCredentials {
  accessToken: string
  refreshToken: string
  expiryDate: number
}

export interface EmailReceipt {
  messageId: string
  date: Date
  subject: string
  from: string
  body: string
  attachments: Array<{
    filename: string
    contentType: string
    data: Buffer
  }>
}

export interface BankCharge {
  date: Date
  amount: number
  description: string
  merchant: string
}

export interface GmailAccount {
  id: string
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  expiryDate: number
  isActive: boolean
  lastSync: Date
}

export interface ParsedReceipt {
  amount: number
  date: Date
  merchant: string
  items?: Array<{
    description: string
    amount: number
    quantity?: number
  }>
  confidence: number
  source: {
    type: 'text' | 'pdf' | 'image'
    format: string
    raw: string
  }
} 