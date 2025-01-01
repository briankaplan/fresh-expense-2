import { prisma } from '@/lib/db'
import { MatchResult } from './types'

interface MerchantAnalytics {
  subscriptionPatterns: {
    frequency: string
    amount: number
    confidence: number
    lastSeen: Date
    count: number
  }[]
  duplicateStats: {
    last30Days: number
    last90Days: number
    averageConfidence: number
  }
  matchingAccuracy: {
    successful: number
    failed: number
    accuracy: number
  }
}

export async function updateAnalytics(merchantName: string, results: MatchResult) {
  // Get existing analytics
  let analytics = await prisma.merchantAnalytics.findUnique({
    where: { merchantName }
  })

  // Update subscription patterns
  const updatedPatterns = mergeSubscriptionPatterns(
    analytics?.subscriptionPatterns || [],
    results.subscriptions.detected
  )

  // Update duplicate statistics
  const duplicateStats = await calculateDuplicateStats(merchantName)

  // Update matching accuracy
  const matchingAccuracy = await calculateMatchingAccuracy(merchantName)

  // Save updated analytics
  await prisma.merchantAnalytics.upsert({
    where: { merchantName },
    create: {
      merchantName,
      subscriptionPatterns: updatedPatterns,
      duplicateStats,
      matchingAccuracy,
      updatedAt: new Date()
    },
    update: {
      subscriptionPatterns: updatedPatterns,
      duplicateStats,
      matchingAccuracy,
      updatedAt: new Date()
    }
  })
}

export async function generateReport(merchantName: string, timeRange: { start: Date, end: Date }) {
  const analytics = await prisma.merchantAnalytics.findUnique({
    where: { merchantName }
  })

  const receipts = await prisma.receipt.findMany({
    where: {
      merchant: merchantName,
      date: {
        gte: timeRange.start,
        lte: timeRange.end
      }
    },
    include: {
      items: true,
      matchingResults: true
    }
  })

  return {
    summary: {
      totalReceipts: receipts.length,
      totalAmount: receipts.reduce((sum, r) => sum + r.amount, 0),
      subscriptions: analytics?.subscriptionPatterns.length || 0,
      duplicatesFound: analytics?.duplicateStats.last30Days || 0
    },
    subscriptions: analytics?.subscriptionPatterns.map(p => ({
      ...p,
      nextExpected: calculateNextExpectedDate(p)
    })),
    recommendations: generateRecommendations(receipts, analytics)
  }
}

function generateRecommendations(receipts: any[], analytics: any) {
  const recommendations = []

  // Check for potential cost savings
  const subscriptionCosts = analyzeSubscriptionCosts(receipts, analytics)
  if (subscriptionCosts.potentialSavings > 0) {
    recommendations.push({
      type: 'cost_saving',
      description: `Potential savings of $${subscriptionCosts.potentialSavings} found in subscription costs`,
      details: subscriptionCosts.details
    })
  }

  // Check for duplicate prevention
  if (analytics.duplicateStats.last30Days > 0) {
    recommendations.push({
      type: 'duplicate_prevention',
      description: 'Consider implementing additional duplicate detection measures',
      details: analytics.duplicateStats
    })
  }

  return recommendations
} 