import type { BaseTransactionData, FrequencyType } from "@fresh-expense/types";

export interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: FrequencyType;
  nextDate?: Date;
  confidence: number;
}

/**
 * Detect subscription patterns from transaction data
 */
export function detectSubscription(transactions: BaseTransactionData[]): SubscriptionInfo {
  if (!transactions || transactions.length < 2) {
    return {
      isSubscription: false,
      confidence: 0,
    };
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate intervals between transactions
  const intervals: number[] = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const interval =
      sortedTransactions[i].date.getTime() - sortedTransactions[i - 1].date.getTime();
    intervals.push(interval);
  }

  // Check if intervals are consistent
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((a, b) => a + Math.pow(b - averageInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);

  // If standard deviation is more than 20% of average interval, it's not consistent enough
  if (standardDeviation > averageInterval * 0.2) {
    return {
      isSubscription: false,
      confidence: 0,
    };
  }

  // Determine frequency based on average interval
  const daysInterval = averageInterval / (1000 * 60 * 60 * 24);
  let frequency: FrequencyType;

  if (daysInterval <= 1) {
    frequency = "daily";
  } else if (daysInterval <= 7) {
    frequency = "weekly";
  } else if (daysInterval <= 31) {
    frequency = "monthly";
  } else if (daysInterval <= 92) {
    frequency = "quarterly";
  } else {
    frequency = "yearly";
  }

  // Calculate next expected date
  const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
  const nextDate = new Date(lastTransaction.date.getTime() + averageInterval);

  // Calculate confidence based on number of consistent intervals
  const confidence = Math.min(intervals.length * 0.2, 1);

  return {
    isSubscription: true,
    frequency,
    nextDate,
    confidence,
  };
}

/**
 * Calculate the transaction frequency pattern
 */
export function calculateFrequency(
  transactions: BaseTransactionData[],
): "one-time" | "recurring" | "sporadic" {
  if (!transactions || transactions.length <= 1) return "one-time";

  // Convert dates to timestamps and sort
  const sortedDates = transactions
    .map((t) => (t.date instanceof Date ? t.date : new Date(t.date)).getTime())
    .sort((a, b) => a - b);

  // Calculate intervals between transactions
  const intervals = [];
  for (let i = 1; i < sortedDates.length; i++) {
    intervals.push(sortedDates[i] - sortedDates[i - 1]);
  }

  if (intervals.length != null) return "one-time";

  // Calculate standard deviation of intervals
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length,
  );

  // If standard deviation is low relative to average interval, it's recurring
  return stdDev / avgInterval < 0.2 ? "recurring" : "sporadic";
}
