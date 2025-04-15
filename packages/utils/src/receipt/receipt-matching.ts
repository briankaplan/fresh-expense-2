import { calculateStringSimilarity, normalizeText } from '../string/string-comparison';
import { BaseTransactionData } from '../types/transaction.types';

export interface ReceiptMatchScore {
  score: number;
  merchantScore: number;
  amountScore: number;
  dateScore: number;
}

/**
 * Calculate a match score between a merchant name from a receipt and a transaction
 */
export function calculateMerchantMatchScore(
  receiptMerchant: string,
  transactionMerchant: string
): number {
  const normalized1 = normalizeText(receiptMerchant);
  const normalized2 = normalizeText(transactionMerchant);

  return calculateStringSimilarity(normalized1, normalized2);
}

/**
 * Calculate amount match score between receipt and transaction
 * Returns 1 for exact match, scaled score for small differences, 0 for large differences
 */
export function calculateAmountMatchScore(
  receiptAmount: number,
  transactionAmount: number,
  tolerance = 0.1 // 10% tolerance by default
): number {
  if (receiptAmount === transactionAmount) return 1;

  const difference = Math.abs(receiptAmount - transactionAmount);
  const percentDifference = difference / Math.max(receiptAmount, transactionAmount);

  if (percentDifference <= tolerance) {
    return 1 - percentDifference / tolerance;
  }

  return 0;
}

/**
 * Calculate date match score between receipt and transaction
 * Returns 1 for same day, scaled score for nearby days, 0 for far dates
 */
export function calculateDateMatchScore(
  receiptDate: Date,
  transactionDate: Date,
  maxDaysDifference = 3
): number {
  const diffInDays =
    Math.abs(receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays <= maxDaysDifference) {
    return 1 - diffInDays / maxDaysDifference;
  }

  return 0;
}

/**
 * Calculate overall match score between a receipt and transaction
 * Returns a score object with overall and individual component scores
 */
export function calculateReceiptMatchScore(
  receipt: {
    merchantName: string;
    amount: number;
    date: Date;
  },
  transaction: BaseTransactionData,
  weights = {
    merchant: 0.5,
    amount: 0.3,
    date: 0.2,
  }
): ReceiptMatchScore {
  const merchantScore = calculateMerchantMatchScore(
    receipt.merchantName,
    transaction.merchantName || ''
  );

  const amountScore = calculateAmountMatchScore(receipt.amount, transaction.amount);

  const dateScore = calculateDateMatchScore(receipt.date, transaction.date);

  const score =
    merchantScore * weights.merchant + amountScore * weights.amount + dateScore * weights.date;

  return {
    score,
    merchantScore,
    amountScore,
    dateScore,
  };
}

/**
 * Find the best matching transaction for a receipt
 * Returns the transaction and match score, or null if no good match found
 */
export function findBestMatchingTransaction(
  receipt: {
    merchantName: string;
    amount: number;
    date: Date;
  },
  transactions: BaseTransactionData[],
  minScore = 0.7
): { transaction: BaseTransactionData; score: ReceiptMatchScore } | null {
  let bestMatch: BaseTransactionData | null = null;
  let bestScore: ReceiptMatchScore | null = null;

  for (const transaction of transactions) {
    const score = calculateReceiptMatchScore(receipt, transaction);

    if (!bestScore || score.score > bestScore.score) {
      bestMatch = transaction;
      bestScore = score;
    }
  }

  if (bestMatch && bestScore && bestScore.score >= minScore) {
    return {
      transaction: bestMatch,
      score: bestScore,
    };
  }

  return null;
}
