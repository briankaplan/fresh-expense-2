import type { BaseTransactionData, MatchScoreDetails, ReceiptMatchingOptions } from "./types";

export function findBestReceiptMatch(
  target: BaseTransactionData,
  candidates: BaseTransactionData[],
  options: ReceiptMatchingOptions = {
    minConfidence: 0.8,
    maxDateDifference: 3,
    maxAmountDifference: 0.1,
    merchantMatchThreshold: 0.8,
  },
): {
  match: BaseTransactionData | null;
  score: number;
  details: MatchScoreDetails;
} {
  let bestMatch: BaseTransactionData | null = null;
  let bestScore = 0;
  let bestDetails: MatchScoreDetails = {
    merchantScore: 0,
    amountScore: 0,
    dateScore: 0,
    totalScore: 0,
  };

  for (const candidate of candidates) {
    const { score, details } = calculateReceiptMatchScore(target, candidate, options);
    if (score > bestScore && score >= (options.minConfidence || 0.8)) {
      bestMatch = candidate;
      bestScore = score;
      bestDetails = details;
    }
  }

  return { match: bestMatch, score: bestScore, details: bestDetails };
}

export function calculateReceiptMatchScore(
  receipt1: BaseTransactionData,
  receipt2: BaseTransactionData,
  options: ReceiptMatchingOptions = {},
): { score: number; details: MatchScoreDetails } {
  const merchantScore = calculateMerchantMatchScore(receipt1.merchantName, receipt2.merchantName);
  const amountScore = calculateAmountMatchScore(
    receipt1.amount,
    receipt2.amount,
    options.maxAmountDifference,
  );
  const dateScore = calculateDateMatchScore(
    receipt1.date,
    receipt2.date,
    options.maxDateDifference,
  );

  const totalScore = (merchantScore + amountScore + dateScore) / 3;

  return {
    score: totalScore,
    details: {
      merchantScore,
      amountScore,
      dateScore,
      totalScore,
    },
  };
}

export function calculateMerchantMatchScore(merchant1: string, merchant2: string): number {
  if (!merchant1 || !merchant2) return 0;

  const normalized1 = merchant1.toLowerCase().trim();
  const normalized2 = merchant2.toLowerCase().trim();

  if (normalized1 === normalized2) return 1;

  // Simple Levenshtein distance-based score
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const distance = levenshteinDistance(normalized1, normalized2);
  return 1 - distance / maxLength;
}

export function calculateAmountMatchScore(
  amount1: number,
  amount2: number,
  maxDifference = 0.1,
): number {
  if (typeof amount1 !== "number" || typeof amount2 !== "number") return 0;

  const diff = Math.abs(amount1 - amount2);
  const relativeError = amount1 !== 0 ? diff / amount1 : diff;

  return Math.max(0, 1 - relativeError / maxDifference);
}

export function calculateDateMatchScore(date1: Date, date2: Date, maxDaysDifference = 3): number {
  if (!date1 || !date2) return 0;

  const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - diffInDays / maxDaysDifference);
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      }
    }
  }

  return dp[m][n];
}
