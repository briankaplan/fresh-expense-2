import {
  formatCurrency,
  formatDate,
  calculateTotal,
  groupByCategory,
  isValidISODate,
} from './utils';
import { ExpenseCategory } from '@expense/types';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format number as USD currency', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1000.5)).toBe('$1,000.50');
    });

    it('should format number with different currency', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string', () => {
      expect(formatDate('2024-04-07T00:00:00Z')).toBe('Apr 7, 2024');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total of expenses', () => {
      const expenses = [{ amount: 100 }, { amount: 200 }, { amount: 300 }];
      expect(calculateTotal(expenses)).toBe(600);
    });
  });

  describe('groupByCategory', () => {
    it('should group expenses by category', () => {
      const expenses = [
        { category: 'food' as ExpenseCategory, amount: 100 },
        { category: 'food' as ExpenseCategory, amount: 200 },
        { category: 'transportation' as ExpenseCategory, amount: 300 },
      ];
      const result = groupByCategory(expenses);
      expect(result.food).toBe(300);
      expect(result.transportation).toBe(300);
    });
  });

  describe('isValidISODate', () => {
    it('should validate ISO date strings', () => {
      expect(isValidISODate('2024-04-07T00:00:00Z')).toBe(true);
      expect(isValidISODate('invalid-date')).toBe(false);
    });
  });
});
