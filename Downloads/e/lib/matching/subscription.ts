import { prisma } from '@/lib/db'

export async function detectSubscriptions(receipt: any) {
  // Get historical transactions for this merchant
  const historicalTransactions = await prisma.receipt.findMany({
    where: {
      merchant: {
        contains: receipt.merchant.name,
        mode: 'insensitive'
      },
      date: {
        lt: receipt.transaction.date
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  const patterns = findSubscriptionPatterns(historicalTransactions, receipt)
  const anomalies = detectAnomalies(patterns, receipt)

  return {
    patterns,
    anomalies,
    isNewSubscription: patterns.length === 0 && isLikelySubscription(receipt)
  }
}

function findSubscriptionPatterns(history: any[], current: any) {
  const patterns: SubscriptionPattern[] = []
  const amounts = new Map<number, Date[]>()

  // Group by amount
  for (const tx of history) {
    const dates = amounts.get(tx.amount) || []
    dates.push(new Date(tx.date))
    amounts.set(tx.amount, dates)
  }

  // Analyze patterns
  for (const [amount, dates] of amounts.entries()) {
    if (dates.length < 2) continue

    const intervals = analyzeIntervals(dates)
    if (intervals.pattern) {
      patterns.push({
        merchant: current.merchant.name,
        amount,
        frequency: intervals.frequency,
        tolerance: 0.02, // 2% amount tolerance
        dayTolerance: intervals.dayVariance,
        lastSeen: dates[0],
        confidence: calculateConfidence(intervals, dates.length)
      })
    }
  }

  return patterns
}

function analyzeIntervals(dates: Date[]) {
  const intervals: number[] = []
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i-1].getTime() - dates[i].getTime())
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const dayVariance = calculateDayVariance(intervals)

  // Detect common frequencies
  const days = avgInterval / (1000 * 60 * 60 * 24)
  const frequency = 
    Math.abs(days - 30) < 3 ? 'monthly' :
    Math.abs(days - 365) < 5 ? 'yearly' :
    Math.abs(days - 7) < 1 ? 'weekly' : null

  return {
    pattern: !!frequency,
    frequency,
    dayVariance
  }
}

function isLikelySubscription(receipt: any) {
  // Keywords suggesting subscription
  const subscriptionKeywords = [
    'subscription', 'monthly', 'yearly', 'annual', 'recurring',
    'membership', 'plan', 'service fee'
  ]

  // Check receipt text and items
  const text = [
    receipt.merchant.name,
    ...receipt.items.map(item => item.description)
  ].join(' ').toLowerCase()

  return subscriptionKeywords.some(keyword => text.includes(keyword))
} 