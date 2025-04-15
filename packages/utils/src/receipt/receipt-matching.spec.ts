import { describe, it, expect } from 'vitest';
import {
  calculateMerchantMatchScore,
  calculateAmountMatchScore,
  calculateDateMatchScore,
  calculateReceiptMatchScore,
  findBestMatchingTransaction,
} from './receipt-matching';
import { BaseTransactionData } from '../types/transaction.types';

describe('Receipt Matching Utilities', () => {
  describe('calculateMerchantMatchScore', () => {
    it('should return 1 for identical merchants', () => {
      expect(calculateMerchantMatchScore('Walmart', 'Walmart')).toBe(1);
    });

    it('should return high score for similar merchants', () => {
      const score = calculateMerchantMatchScore('Walmart', 'WALMART');
      expect(score).toBeGreaterThan(0.8);
    });

    it('should return low score for different merchants', () => {
      const score = calculateMerchantMatchScore('Walmart', 'Target');
      expect(score).toBeLessThan(0.5);
    });
  });

  describe('calculateAmountMatchScore', () => {
    it('should return 1 for identical amounts', () => {
      expect(calculateAmountMatchScore(100, 100)).toBe(1);
    });

    it('should return high score for small differences', () => {
      const score = calculateAmountMatchScore(100, 105); // 5% difference
      expect(score).toBeGreaterThan(0.5);
    });

    it('should return 0 for large differences', () => {
      expect(calculateAmountMatchScore(100, 200)).toBe(0);
    });
  });

  describe('calculateDateMatchScore', () => {
    it('should return 1 for same day', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-15');
      expect(calculateDateMatchScore(date1, date2)).toBe(1);
    });

    it('should return high score for close dates', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-16');
      const score = calculateDateMatchScore(date1, date2);
      expect(score).toBeGreaterThan(0.6);
    });

    it('should return 0 for distant dates', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-25');
      expect(calculateDateMatchScore(date1, date2)).toBe(0);
    });
  });

  describe('calculateReceiptMatchScore', () => {
    const receipt = {
      merchantName: 'Walmart',
      amount: 100,
      date: new Date('2024-03-15'),
    };

    const transaction: BaseTransactionData = {
      id: '123',
      accountId: '456',
      amount: 100,
      date: new Date('2024-03-15'),
      description: 'Purchase at Walmart',
      type: 'debit',
      status: 'posted',
      merchantName: 'WALMART',
    };

    it('should return high score for matching receipt and transaction', () => {
      const result = calculateReceiptMatchScore(receipt, transaction);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.merchantScore).toBeGreaterThan(0.8);
      expect(result.amountScore).toBe(1);
      expect(result.dateScore).toBe(1);
    });

    it('should return lower score for partially matching receipt and transaction', () => {
      const partialMatch = {
        ...transaction,
        amount: 110,
        date: new Date('2024-03-16'),
      };
      const result = calculateReceiptMatchScore(receipt, partialMatch);
      expect(result.score).toBeLessThan(0.8);
    });
  });

  describe('findBestMatchingTransaction', () => {
    const receipt = {
      merchantName: 'Walmart',
      amount: 100,
      date: new Date('2024-03-15'),
    };

    const transactions: BaseTransactionData[] = [
      {
        id: '123',
        accountId: '456',
        amount: 100,
        date: new Date('2024-03-15'),
        description: 'Purchase at Walmart',
        type: 'debit',
        status: 'posted',
        merchantName: 'WALMART',
      },
      {
        id: '124',
        accountId: '456',
        amount: 200,
        date: new Date('2024-03-16'),
        description: 'Purchase at Target',
        type: 'debit',
        status: 'posted',
        merchantName: 'TARGET',
      },
    ];

    it('should find the best matching transaction', () => {
      const result = findBestMatchingTransaction(receipt, transactions);
      expect(result).not.toBeNull();
      expect(result?.transaction.id).toBe('123');
      expect(result?.score.score).toBeGreaterThan(0.8);
    });

    it('should return null if no good match found', () => {
      const noMatch = findBestMatchingTransaction({ ...receipt, amount: 500 }, transactions, 0.9);
      expect(noMatch).toBeNull();
    });
  });
});
