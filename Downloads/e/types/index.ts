export interface ApiResponse<T> {
  data?: T
  error?: string
  status: 'success' | 'error'
}

export interface SearchParams {
  query?: string
  startDate?: string
  endDate?: string
  category?: string
  page?: number
  limit?: number
}

export interface Receipt {
  id: string
  fileName: string
  fileUrl: string
  amount: number | null
  date: Date | null
  merchant: string | null
  category: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  matchConfidence?: number
  metadata?: Record<string, any>
  statementEntry?: StatementEntry
}

export interface StatementEntry {
  id: string
  date: Date
  amount: number
  description: string
  matchStatus?: 'matched' | 'no_match' | 'pending'
} 