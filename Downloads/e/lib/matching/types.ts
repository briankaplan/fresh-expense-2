export interface SubscriptionPattern {
  merchant: string
  amount: number
  frequency: 'monthly' | 'yearly' | 'weekly'
  tolerance: number
  dayTolerance: number
  lastSeen?: Date
  confidence: number
}

export interface DuplicateGroup {
  transactions: any[]
  confidence: number
  reason: string[]
}

export interface MatchResult {
  subscriptions: {
    detected: SubscriptionPattern[]
    newPatterns: SubscriptionPattern[]
    anomalies: any[]
  }
  duplicates: DuplicateGroup[]
  statementMatches: any[]
} 