import { BaseTransactionData, TransactionCategory } from '../types/transaction.types';
import { normalizeCategory, isValidCategory } from './category-utils';
import { detectSubscription, calculateFrequency } from './subscription-detection';

export interface TransactionAnalysis {
  totalSpent: number;
  averageTransaction: number;
  frequency: 'rare' | 'occasional' | 'frequent';
  lastPurchase?: Date;
  category: TransactionCategory;
  transactions: BaseTransactionData[];
  subscription?: {
    isSubscription: boolean;
    frequency?: string;
    nextPaymentDate?: Date;
    amount?: number;
  };
}

/**
 * Determine the dominant category from a set of transactions
 */
export function determineCategory(transactions: BaseTransactionData[]): TransactionCategory {
  if (!transactions || transactions.length === 0) return 'OTHER';

  // Count occurrences of each category
  const categoryCounts = new Map<TransactionCategory, number>();

  transactions.forEach(t => {
    if (!t.category) return;

    const categories = Array.isArray(t.category) ? t.category : [t.category];

    categories.forEach(cat => {
      if (typeof cat !== 'string') return;

      const normalizedCategory = normalizeCategory(cat);
      if (isValidCategory(normalizedCategory)) {
        const count = categoryCounts.get(normalizedCategory) || 0;
        categoryCounts.set(normalizedCategory, count + 1);
      }
    });
  });

  // Find the most common category
  let maxCount = 0;
  let dominantCategory: TransactionCategory = 'OTHER';

  categoryCounts.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = category;
    }
  });

  return dominantCategory;
}

/**
 * Analyze transaction history and detect patterns
 */
export function analyzeTransactions(transactions: BaseTransactionData[]): TransactionAnalysis {
  if (!transactions || transactions.length === 0) {
    return {
      totalSpent: 0,
      averageTransaction: 0,
      frequency: 'rare',
      category: 'OTHER',
      transactions: [],
    };
  }

  // Calculate total and average amounts
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = totalSpent / transactions.length;

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Get the most recent transaction date
  const mostRecentDate =
    sortedTransactions[0].date instanceof Date
      ? sortedTransactions[0].date
      : new Date(sortedTransactions[0].date);

  // Determine transaction frequency
  const frequency = (() => {
    const pattern = calculateFrequency(transactions);
    switch (pattern) {
      case 'recurring':
        return 'frequent';
      case 'sporadic':
        return 'occasional';
      default:
        return 'rare';
    }
  })();

  // Check for subscription patterns
  const subscription = detectSubscription(transactions);

  return {
    totalSpent,
    averageTransaction,
    frequency,
    lastPurchase: mostRecentDate,
    category: determineCategory(transactions),
    transactions: sortedTransactions,
    subscription: subscription.isSubscription ? subscription : undefined,
  };
}
