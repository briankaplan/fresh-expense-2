import { detectSubscriptions } from './subscription'
import { findDuplicates } from './duplicates'
import { findMatchingStatementEntry } from './statement'

export async function analyzeReceipt(receipt: any): Promise<MatchResult> {
  const [
    subscriptionResults,
    duplicateGroups,
    statementMatches
  ] = await Promise.all([
    detectSubscriptions(receipt),
    findDuplicates(receipt),
    findMatchingStatementEntry({
      amount: receipt.transaction.total,
      date: new Date(receipt.transaction.date),
      merchant: receipt.merchant.name
    })
  ])

  return {
    subscriptions: {
      detected: subscriptionResults.patterns,
      newPatterns: subscriptionResults.isNewSubscription ? [
        {
          merchant: receipt.merchant.name,
          amount: receipt.transaction.total,
          frequency: 'monthly', // Default assumption
          tolerance: 0.02,
          dayTolerance: 3,
          confidence: 0.6
        }
      ] : [],
      anomalies: subscriptionResults.anomalies
    },
    duplicates: duplicateGroups,
    statementMatches
  }
} 