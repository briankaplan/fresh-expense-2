'use client';

import { Expense, BankTransaction, CashExpense } from '@/types';
import { compareDates, getDaysBetween } from '@/utils/dateUtils';
import { parseCurrency } from '@/utils/bankCSVParser';
import { isBusinessExpense } from './categorization/merchantCategories';

interface MatchResult {
  expense: Expense;
  isDuplicate: boolean;
  confidence: number;
  reasons: string[];
  conflicts?: ConflictResolution[];
  historyEntry?: MergeHistory;
}

interface MergeHistory {
  id: string;
  timestamp: string;
  action: 'merge' | 'split' | 'update';
  sourceIds: string[];
  resultId: string;
  metadata: {
    confidence: number;
    reasons: string[];
    canUndo: boolean;
  };
}

interface ConflictResolution {
  field: string;
  resolution: 'keep_existing' | 'use_new' | 'merge' | 'manual';
  manualValue?: any;
  reason: string;
}

// Enhanced match thresholds with confidence levels
const MATCH_THRESHOLDS = {
  EXACT: 0.95,
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
  FUZZY: 0.3
};

// Enhanced matching configuration
const MATCH_CONFIG = {
  AMOUNT_TOLERANCE: 0.01,
  DATE_TOLERANCE_DAYS: 3,
  DESCRIPTION_SIMILARITY: 0.7,
  MERCHANT_PARTIAL_MATCH: 0.8,
  CATEGORY_MATCH: 0.6,
  RECURRING_PATTERN_DAYS: [7, 14, 28, 30, 31], // Common recurring intervals
  SPLIT_TOLERANCE: 0.02, // 2% tolerance for split transactions
  TAX_RATES: [0.0625, 0.07, 0.0825, 0.0925, 0.10],
  TIP_PERCENTAGES: [0.15, 0.18, 0.20, 0.22, 0.25],
  COMMON_ROUND_AMOUNTS: [5, 10, 20, 25, 50, 100]
};

// Enhanced matching weights with context
const MATCH_WEIGHTS = {
  AMOUNT: {
    EXACT: 0.35,
    PATTERN: 0.15
  },
  DATE: {
    EXACT: 0.25,
    PATTERN: 0.10
  },
  MERCHANT: {
    EXACT: 0.20,
    FUZZY: 0.15,
    PATTERN: 0.05
  },
  DESCRIPTION: 0.10,
  CATEGORY: 0.05,
  RECEIPT: 0.05
};

function calculateLevenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }

  return 1 - dp[m][n] / Math.max(m, n); // Normalized similarity score
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

function calculateMatchConfidence(
  expense1: Expense | BankTransaction,
  expense2: Expense
): { confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let totalScore = 0;
  let weightSum = 0;

  // Amount matching (highest weight)
  const amountScore = calculateAmountScore(expense1.amount, expense2.amount);
  totalScore += amountScore.score * MATCH_WEIGHTS.AMOUNT;
  reasons.push(amountScore.reason);
  weightSum += MATCH_WEIGHTS.AMOUNT;

  // Date matching
  const dateScore = calculateDateScore(expense1.date, expense2.date);
  totalScore += dateScore.score * MATCH_WEIGHTS.DATE;
  reasons.push(dateScore.reason);
  weightSum += MATCH_WEIGHTS.DATE;

  // Merchant matching
  if (expense1.merchant && expense2.merchant) {
    const merchantScore = calculateMerchantScore(expense1.merchant, expense2.merchant);
    totalScore += merchantScore.score * MATCH_WEIGHTS.MERCHANT;
    reasons.push(merchantScore.reason);
    weightSum += MATCH_WEIGHTS.MERCHANT;
  }

  // Description matching
  if ('description' in expense1 && expense1.description && expense2.description) {
    const descScore = calculateDescriptionScore(expense1.description, expense2.description);
    totalScore += descScore.score * MATCH_WEIGHTS.DESCRIPTION;
    reasons.push(descScore.reason);
    weightSum += MATCH_WEIGHTS.DESCRIPTION;
  }

  // Category matching
  if ('category' in expense1 && expense1.category && expense2.category) {
    const categoryScore = calculateCategoryScore(expense1.category, expense2.category);
    totalScore += categoryScore.score * MATCH_WEIGHTS.CATEGORY;
    reasons.push(categoryScore.reason);
    weightSum += MATCH_WEIGHTS.CATEGORY;
  }

  // Receipt matching
  if ('receiptUrl' in expense1 && expense1.receiptUrl && expense2.receiptUrl) {
    const receiptScore = calculateReceiptScore(expense1.receiptUrl, expense2.receiptUrl);
    totalScore += receiptScore.score * MATCH_WEIGHTS.RECEIPT;
    reasons.push(receiptScore.reason);
    weightSum += MATCH_WEIGHTS.RECEIPT;
  }

  // Business/Personal matching
  if ('isBusiness' in expense1 && 'isBusiness' in expense2) {
    if (expense1.isBusiness === expense2.isBusiness) {
      reasons.push(`Both expenses are ${expense1.isBusiness ? 'business' : 'personal'}`);
    }
  }

  // Add amount pattern matching
  const patterns1 = detectAmountPattern(expense1.amount);
  const patterns2 = detectAmountPattern(expense2.amount);
  
  if (patterns1.length > 0 && patterns2.length > 0) {
    const matchingPatterns = patterns1.filter(p1 => 
      patterns2.some(p2 => p1.type === p2.type)
    );
    
    if (matchingPatterns.length > 0) {
      const patternScore = matchingPatterns.reduce((acc, p) => acc + p.confidence, 0) / matchingPatterns.length;
      totalScore += patternScore * MATCH_WEIGHTS.AMOUNT * 0.2;  // 20% bonus for matching patterns
      reasons.push(...matchingPatterns.map(p => p.reason));
    }
  }

  // Add Jaro-Winkler for merchant matching
  if (expense1.merchant && expense2.merchant) {
    const jaroScore = calculateJaroWinklerSimilarity(
      cleanText(expense1.merchant),
      cleanText(expense2.merchant)
    );
    
    if (jaroScore > MATCH_CONFIG.MERCHANT_PARTIAL_MATCH) {
      totalScore += jaroScore * MATCH_WEIGHTS.MERCHANT * 0.3;  // 30% bonus for high similarity
      reasons.push('High merchant name similarity (Jaro-Winkler)');
    }
  }

  const confidence = totalScore / weightSum;

  return { 
    confidence, 
    reasons: reasons.filter(r => r) // Remove empty reasons
  };
}

function calculateAmountScore(amount1: number, amount2: number): { score: number; reason: string } {
  const amountDiff = Math.abs(amount1 - amount2) / amount1;
  
  if (amountDiff === 0) {
    return { score: 1, reason: 'Amount matches exactly' };
  } else if (amountDiff < MATCH_CONFIG.AMOUNT_TOLERANCE) {
    return { 
      score: 0.9, 
      reason: `Amount differs by ${(amountDiff * 100).toFixed(2)}%`
    };
  } else if (amountDiff < MATCH_CONFIG.AMOUNT_TOLERANCE * 2) {
    return { 
      score: 0.7, 
      reason: 'Amount matches within extended tolerance'
    };
  }
  
  return { score: 0, reason: '' };
}

function calculateDateScore(date1: string, date2: string): { score: number; reason: string } {
  const daysDiff = getDaysBetween(date1, date2);
  
  if (daysDiff === 0) {
    return { score: 1, reason: 'Date matches exactly' };
  } else if (daysDiff <= MATCH_CONFIG.DATE_TOLERANCE_DAYS) {
    const score = 1 - (daysDiff / MATCH_CONFIG.DATE_TOLERANCE_DAYS);
    return { 
      score, 
      reason: `Date differs by ${daysDiff} day${daysDiff > 1 ? 's' : ''}`
    };
  }
  
  return { score: 0, reason: '' };
}

function calculateMerchantScore(merchant1: string, merchant2: string): { score: number; reason: string } {
  const clean1 = cleanText(merchant1);
  const clean2 = cleanText(merchant2);
  
  if (clean1 === clean2) {
    return { score: 1, reason: 'Merchant matches exactly' };
  }
  
  const similarity = calculateLevenshteinDistance(clean1, clean2);
  if (similarity >= MATCH_CONFIG.MERCHANT_PARTIAL_MATCH) {
    return { 
      score: similarity, 
      reason: 'Merchant names are similar' 
    };
  }
  
  return { score: 0, reason: '' };
}

// Add new matching algorithms
function calculateJaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = calculateJaroSimilarity(s1, s2);
  const prefixLength = commonPrefixLength(s1, s2, 4);
  return jaro + (prefixLength * 0.1 * (1 - jaro));
}

function calculateJaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  
  const s1Matches: boolean[] = Array(len1).fill(false);
  const s2Matches: boolean[] = Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }
  
  if (matches === 0) return 0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  return (
    (matches / len1 +
    matches / len2 +
    (matches - transpositions / 2) / matches) / 3
  );
}

function commonPrefixLength(s1: string, s2: string, maxLength: number): number {
  const minLength = Math.min(maxLength, s1.length, s2.length);
  for (let i = 0; i < minLength; i++) {
    if (s1[i] !== s2[i]) return i;
  }
  return minLength;
}

// Add pattern detection
interface AmountPattern {
  type: 'round' | 'recurring' | 'split' | 'tax' | 'tip' | 'subscription';
  confidence: number;
  reason: string;
  metadata?: {
    baseAmount?: number;
    rate?: number;
    pattern?: string;
    interval?: number;
  };
}

function detectAmountPatterns(amount: number, date?: string, history?: BankTransaction[]): AmountPattern[] {
  const patterns: AmountPattern[] = [];
  
  // Round number detection with common amounts
  if (Number.isInteger(amount)) {
    const isCommonAmount = MATCH_CONFIG.COMMON_ROUND_AMOUNTS.includes(amount);
    patterns.push({
      type: 'round',
      confidence: isCommonAmount ? 0.9 : 0.8,
      reason: isCommonAmount ? 'Common round dollar amount' : 'Round dollar amount',
      metadata: { baseAmount: amount }
    });
  }

  // Enhanced tax detection with regional rates
  const taxPatterns = detectTaxPatterns(amount);
  patterns.push(...taxPatterns);

  // Enhanced tip detection with common percentages
  const tipPatterns = detectTipPatterns(amount);
  patterns.push(...tipPatterns);

  // Recurring payment detection
  if (history && date) {
    const recurringPatterns = detectRecurringPatterns(amount, date, history);
    patterns.push(...recurringPatterns);
  }

  // Split payment detection
  const splitPatterns = detectSplitPatterns(amount);
  patterns.push(...splitPatterns);

  // Subscription amount detection
  const subscriptionPatterns = detectSubscriptionPatterns(amount);
  patterns.push(...subscriptionPatterns);

  return patterns;
}

function detectTaxPatterns(amount: number): AmountPattern[] {
  const patterns: AmountPattern[] = [];
  
  MATCH_CONFIG.TAX_RATES.forEach(rate => {
    const baseAmount = amount / (1 + rate);
    if (Number.isInteger(baseAmount * 100)) { // Check for reasonable base amount
      const expectedTotal = baseAmount * (1 + rate);
      if (Math.abs(expectedTotal - amount) < 0.01) {
        patterns.push({
          type: 'tax',
          confidence: 0.9,
          reason: `Matches ${(rate * 100).toFixed(1)}% tax rate`,
          metadata: {
            baseAmount,
            rate
          }
        });
      }
    }
  });

  return patterns;
}

function detectRecurringPatterns(
  amount: number,
  date: string,
  history: BankTransaction[]
): AmountPattern[] {
  const patterns: AmountPattern[] = [];
  const similarAmounts = history.filter(t => 
    Math.abs(t.amount - amount) < MATCH_CONFIG.AMOUNT_TOLERANCE * amount
  );

  if (similarAmounts.length >= 2) {
    const intervals = similarAmounts.map(t => 
      Math.abs(getDaysBetween(t.date, date))
    );

    MATCH_CONFIG.RECURRING_PATTERN_DAYS.forEach(interval => {
      const matchingIntervals = intervals.filter(i => 
        Math.abs(i % interval) <= 2
      );

      if (matchingIntervals.length >= 2) {
        patterns.push({
          type: 'recurring',
          confidence: 0.85 + (matchingIntervals.length * 0.05),
          reason: `Recurring payment every ${interval} days`,
          metadata: {
            interval,
            pattern: `${interval}-day cycle`
          }
        });
      }
    });
  }

  return patterns;
}

export function findPotentialMatches(
  expense: Expense | BankTransaction,
  existingExpenses: Expense[]
): MatchResult[] {
  return existingExpenses.map(existing => {
    const { confidence, reasons } = calculateMatchConfidence(expense, existing);
    
    return {
      expense: existing,
      isDuplicate: confidence > MATCH_THRESHOLDS.MEDIUM,
      confidence,
      reasons
    };
  })
  .filter(match => match.confidence > MATCH_THRESHOLDS.LOW)
  .sort((a, b) => b.confidence - a.confidence);
}

export function mergeExpenses(
  expense1: Expense | BankTransaction,
  expense2: Expense,
  resolution: ConflictResolution[] = []
): Expense {
  const base = { ...expense2 };

  // Apply manual resolutions first
  resolution.forEach(conflict => {
    const field = conflict.field as keyof Expense;
    switch (conflict.resolution) {
      case 'use_new':
        base[field] = expense1[field];
        break;
      case 'merge':
        if (typeof base[field] === 'string' && typeof expense1[field] === 'string') {
          base[field] = `${base[field]}; ${expense1[field]}`;
        }
        break;
      case 'manual':
        if (conflict.manualValue !== undefined) {
          base[field] = conflict.manualValue;
        }
        break;
    }
  });

  // Merge remaining fields intelligently
  if (!base.receiptUrl && 'receiptUrl' in expense1 && expense1.receiptUrl) {
    base.receiptUrl = expense1.receiptUrl;
    base.hasReceipt = true;
  }

  if (!base.category && 'category' in expense1 && expense1.category) {
    base.category = expense1.category;
  }

  if (!base.notes && 'notes' in expense1 && expense1.notes) {
    base.notes = expense1.notes;
  }

  return base;
} 