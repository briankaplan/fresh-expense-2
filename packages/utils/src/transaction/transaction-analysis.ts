import {
  BaseTransactionData,
  TransactionCategory,
  TransactionSummary,
} from '../types/transaction.types';
import { normalizeCategory } from '../merchant/category-utils';

/**
 * Analyze transactions to determine patterns and summary statistics
 */
export function analyzeTransactions(transactions: BaseTransactionData[]): TransactionSummary {
  if (!transactions || transactions.length === 0) {
    return {
      totalSpent: 0,
      averageTransaction: 0,
      transactions: [],
    };
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate total and average
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = totalSpent / transactions.length;

  // Get the most common category
  const categoryCount = new Map<string, number>();
  transactions.forEach(t => {
    if (t.category) {
      const normalized = normalizeCategory(t.category.toString());
      categoryCount.set(normalized, (categoryCount.get(normalized) || 0) + 1);
    }
  });

  let mostCommonCategory: TransactionCategory | undefined;
  let maxCount = 0;
  categoryCount.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonCategory = category as TransactionCategory;
    }
  });

  // Calculate frequency if more than one transaction
  let frequency: string | undefined;
  if (transactions.length > 1) {
    const firstDate = sortedTransactions[0].date;
    const lastDate = sortedTransactions[sortedTransactions.length - 1].date;
    const daysBetween = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const transactionsPerMonth = (transactions.length / daysBetween) * 30;

    if (transactionsPerMonth >= 28) {
      frequency = 'daily';
    } else if (transactionsPerMonth >= 4) {
      frequency = 'weekly';
    } else if (transactionsPerMonth >= 0.9) {
      frequency = 'monthly';
    } else if (transactionsPerMonth >= 0.3) {
      frequency = 'quarterly';
    } else {
      frequency = 'yearly';
    }
  }

  return {
    totalSpent,
    averageTransaction,
    frequency,
    lastPurchase: sortedTransactions[sortedTransactions.length - 1].date,
    category: mostCommonCategory,
    transactions: sortedTransactions,
  };
}

/**
 * Determine the most likely category for a transaction based on description and merchant
 */
export function determineCategory(transactions: BaseTransactionData[]): TransactionCategory {
  if (!transactions || transactions.length === 0) {
    return 'OTHER';
  }

  // Count categories
  const categoryCount = new Map<string, number>();
  transactions.forEach(t => {
    if (t.category) {
      const normalized = normalizeCategory(t.category.toString());
      categoryCount.set(normalized, (categoryCount.get(normalized) || 0) + 1);
    }
  });

  // Find most common category
  let mostCommonCategory: TransactionCategory = 'OTHER';
  let maxCount = 0;
  categoryCount.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonCategory = category as TransactionCategory;
    }
  });

  return mostCommonCategory;
}
