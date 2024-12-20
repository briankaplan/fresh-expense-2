'use client';

import { BankTransaction, Expense } from '@/types';
import { areMerchantsRelated } from './merchantMatching';

interface ExpenseMatchingResult {
  matched: Array<Expense & { 
    bankTransactionId: string;
    matchConfidence: number;
  }>;
  unmatched: Expense[];
  duplicates: Array<{
    expense: Expense;
    duplicateOf: Expense;
    confidence: number;
  }>;
  needsReceipt: Expense[];
}

interface MatchingOptions {
  maxDaysDifference?: number;
  minMatchConfidence?: number;
  receiptThreshold?: number;
  amountTolerance?: number;
}

export function matchExpensesToTransactions(
  expenses: Expense[],
  bankTransactions: BankTransaction[],
  options: MatchingOptions = {}
): ExpenseMatchingResult {
  const {
    maxDaysDifference = 3,
    minMatchConfidence = 0.7,
    receiptThreshold = 75,
    amountTolerance = 0.01
  } = options;

  const result: ExpenseMatchingResult = {
    matched: [],
    unmatched: [],
    duplicates: [],
    needsReceipt: []
  };

  // First find duplicate expenses
  expenses.forEach(expense => {
    const duplicates = expenses.filter(other => 
      other.id !== expense.id && 
      !result.duplicates.some(d => 
        d.expense.id === other.id || d.duplicateOf.id === other.id
      ) &&
      isDuplicate(expense, other, { amountTolerance })
    );

    if (duplicates.length > 0) {
      duplicates.forEach(duplicate => {
        result.duplicates.push({
          expense: duplicate,
          duplicateOf: expense,
          confidence: calculateDuplicateConfidence(expense, duplicate)
        });
      });
      return;
    }

    // Try to match with bank transaction
    const matches = findPotentialMatches(expense, bankTransactions, {
      maxDaysDifference,
      amountTolerance
    });

    if (matches.length > 0 && matches[0].score >= minMatchConfidence) {
      result.matched.push({
        ...expense,
        bankTransactionId: matches[0].bank.id,
        matchConfidence: matches[0].score
      });
    } else {
      result.unmatched.push(expense);
    }

    // Check if receipt is needed
    if (needsReceipt(expense, receiptThreshold)) {
      result.needsReceipt.push(expense);
    }
  });

  return result;
}

function isDuplicate(
  expense1: Expense, 
  expense2: Expense, 
  { amountTolerance }: Pick<MatchingOptions, 'amountTolerance'>
): boolean {
  return Math.abs(expense1.amount - expense2.amount) <= amountTolerance &&
    areMerchantsRelated(expense1.merchant, expense2.merchant);
}

function calculateDuplicateConfidence(expense1: Expense, expense2: Expense): number {
  let confidence = 0;

  // Exact amount match
  if (expense1.amount === expense2.amount) {
    confidence += 0.5;
  }

  // Same date
  if (expense1.date === expense2.date) {
    confidence += 0.3;
  }

  // Same category
  if (expense1.category === expense2.category) {
    confidence += 0.1;
  }

  // Similar description
  if (expense1.description && expense2.description &&
      areMerchantsRelated(expense1.description, expense2.description)) {
    confidence += 0.1;
  }

  return confidence;
}

function findPotentialMatches(
  expense: Expense,
  bankTransactions: BankTransaction[],
  options: Pick<MatchingOptions, 'maxDaysDifference' | 'amountTolerance'>
): Array<{ bank: BankTransaction; score: number }> {
  return bankTransactions
    .map(bank => ({
      bank,
      score: calculateMatchScore(expense, bank, options)
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

function calculateMatchScore(
  expense: Expense,
  bank: BankTransaction,
  { maxDaysDifference, amountTolerance }: Pick<MatchingOptions, 'maxDaysDifference' | 'amountTolerance'>
): number {
  let score = 0;

  // Check amounts (most important)
  if (Math.abs(expense.amount - bank.amount) <= amountTolerance) {
    score += 0.5;
  } else {
    return 0; // Amounts must match within tolerance
  }

  // Check dates
  const daysDiff = Math.abs(
    (new Date(expense.date).getTime() - new Date(bank.date).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff === 0) {
    score += 0.3;
  } else if (daysDiff <= maxDaysDifference) {
    score += 0.3 * (1 - daysDiff / maxDaysDifference);
  } else {
    return 0; // Dates must be within range
  }

  // Check merchant names
  if (areMerchantsRelated(expense.merchant, bank.description)) {
    score += 0.2;
  }

  return score;
}

function needsReceipt(expense: Expense, threshold: number): boolean {
  return !expense.isPersonal && 
    Math.abs(expense.amount) >= threshold && 
    !expense.hasReceipt;
} 