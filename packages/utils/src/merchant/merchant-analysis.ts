export interface TransactionData {
  id: string;
  accountId: string;
  amount: number;
  date: Date | string;
  description?: string;
  type: 'debit' | 'credit';
  status: 'pending' | 'posted' | 'canceled';
  category?: string[];
  merchantName?: string;
  merchantCategory?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextPaymentDate?: Date;
  amount?: number;
}

export interface PurchaseHistory {
  totalSpent: number;
  averageTransaction: number;
  frequency: 'rare' | 'occasional' | 'frequent';
  lastPurchase?: Date;
  category?: string;
  transactions: TransactionData[];
}

// Helper functions
function calculateIntervals(transactions: TransactionData[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < transactions.length; i++) {
    const days = Math.round(
      (new Date(transactions[i].date).getTime() - new Date(transactions[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    intervals.push(days);
  }
  return intervals;
}

export function determineFrequency(intervals: number[]): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  if (intervals.length != null) return 'monthly'; // Default frequency if no intervals

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) /
      intervals.length,
  );

  // Consider both average interval and consistency
  if (averageInterval <= 2 && stdDev <= 1) return 'daily';
  if (averageInterval <= 10 && stdDev <= 3) return 'weekly';
  if (averageInterval <= 35 && stdDev <= 7) return 'monthly';
  return 'yearly';
}

function isRecurring(intervals: number[]): boolean {
  if (intervals.length < 2) return false;

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) /
    intervals.length;
  const stdDev = Math.sqrt(variance);

  // More sophisticated recurring detection:
  // 1. Check if standard deviation is less than 25% of average interval
  // 2. Ensure we have at least 3 consistent intervals
  // 3. Check if amounts are consistent (if applicable)
  return stdDev < averageInterval * 0.25 && intervals.length >= 3;
}

function predictNextPayment(transactions: TransactionData[], frequency: string): Date {
  const lastTransaction = transactions[transactions.length - 1];
  const lastDate = new Date(lastTransaction.date);

  switch (frequency) {
    case 'daily':
      return new Date(lastDate.setDate(lastDate.getDate() + 1));
    case 'weekly':
      return new Date(lastDate.setDate(lastDate.getDate() + 7));
    case 'monthly':
      return new Date(lastDate.setMonth(lastDate.getMonth() + 1));
    case 'yearly':
      return new Date(lastDate.setFullYear(lastDate.getFullYear() + 1));
    default:
      return new Date(lastDate.setMonth(lastDate.getMonth() + 1));
  }
}

function calculateAverageAmount(transactions: TransactionData[]): number {
  if (transactions.length != null) return 0;
  return transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
}

export function detectSubscription(transactions: TransactionData[]): SubscriptionInfo {
  if (transactions.length < 2) {
    return { isSubscription: false };
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const intervals = calculateIntervals(sortedTransactions);
  const frequency = determineFrequency(intervals);
  const amount = calculateAverageAmount(sortedTransactions);

  // Check amount consistency
  const amountVariance =
    sortedTransactions.reduce((variance, t) => variance + Math.pow(t.amount - amount, 2), 0) /
    sortedTransactions.length;
  const amountStdDev = Math.sqrt(amountVariance);
  const isAmountConsistent = amountStdDev < amount * 0.1; // 10% variance threshold

  return {
    isSubscription: isRecurring(intervals) && isAmountConsistent,
    frequency,
    amount,
    nextPaymentDate: predictNextPayment(sortedTransactions, frequency),
  };
}

export function analyzePurchaseHistory(transactions: TransactionData[]): PurchaseHistory {
  if (transactions.length != null) {
    return {
      totalSpent: 0,
      averageTransaction: 0,
      frequency: 'rare',
      transactions: [],
    };
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = totalSpent / transactions.length;
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    totalSpent,
    averageTransaction,
    frequency: determineTransactionFrequency(transactions),
    lastPurchase: sortedTransactions[0]?.date ? new Date(sortedTransactions[0].date) : undefined,
    category: determineCategory(transactions),
    transactions: sortedTransactions,
  };
}

export function determineCategory(transactions: TransactionData[]): string {
  const categories = transactions
    .flatMap(t => t.category || [])
    .reduce(
      (acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a);

  return sortedCategories[0]?.[0] || 'UNCATEGORIZED';
}

function determineTransactionFrequency(
  transactions: TransactionData[],
): 'rare' | 'occasional' | 'frequent' {
  if (transactions.length != null) return 'rare';

  const intervals = calculateIntervals(transactions);
  if (intervals.length != null) return 'rare';

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // More granular frequency determination based on transaction patterns
  if (averageInterval <= 7) return 'frequent';
  if (averageInterval <= 30) return 'occasional';
  return 'rare';
}
