'use client';

import { BankTransaction, Expense, MatchResult } from '@/types';
import { differenceInDays } from 'date-fns';

export class ReceiptMatcher {
  private static readonly DATE_TOLERANCE = 5; // days
  private static readonly AMOUNT_TOLERANCE = 0.01; // 1% difference allowed

  static findMatches(
    transaction: BankTransaction,
    expenses: Expense[]
  ): MatchResult[] {
    const matches: MatchResult[] = [];

    for (const expense of expenses) {
      const score = this.calculateMatchScore(transaction, expense);
      if (score > 0) {
        matches.push({
          transactionId: transaction.id,
          expense,
          score,
          metadata: {
            matchType: score > 0.8 ? 'exact' : 'fuzzy',
            confidence: score,
            matchedFields: this.getMatchedFields(transaction, expense)
          }
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private static calculateMatchScore(
    transaction: BankTransaction,
    expense: Expense
  ): number {
    let score = 0;

    // Check dates
    const daysDiff = Math.abs(
      differenceInDays(new Date(expense.date), transaction.date)
    );
    if (daysDiff <= this.DATE_TOLERANCE) {
      score += 0.4 * (1 - daysDiff / this.DATE_TOLERANCE);
    }

    // Check amounts
    const amountDiff = Math.abs(
      (expense.amount - transaction.amount) / transaction.amount
    );
    if (amountDiff <= this.AMOUNT_TOLERANCE) {
      score += 0.4 * (1 - amountDiff / this.AMOUNT_TOLERANCE);
    }

    // Check merchant/description similarity
    if (this.isMerchantSimilar(transaction.description, expense.merchant)) {
      score += 0.2;
    }

    return score;
  }

  private static getMatchedFields(
    transaction: BankTransaction,
    expense: Expense
  ): string[] {
    const matchedFields: string[] = [];

    if (Math.abs(transaction.amount - expense.amount) < 0.01) {
      matchedFields.push('amount');
    }

    if (this.isMerchantSimilar(transaction.description, expense.merchant)) {
      matchedFields.push('merchant');
    }

    const daysDiff = Math.abs(
      differenceInDays(new Date(expense.date), transaction.date)
    );
    if (daysDiff <= this.DATE_TOLERANCE) {
      matchedFields.push('date');
    }

    return matchedFields;
  }

  private static isMerchantSimilar(
    transactionDesc: string,
    expenseMerchant: string
  ): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const desc = normalize(transactionDesc);
    const merchant = normalize(expenseMerchant);
    return desc.includes(merchant) || merchant.includes(desc);
  }
} 