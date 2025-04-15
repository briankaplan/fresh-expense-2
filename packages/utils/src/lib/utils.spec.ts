import { describe, it, expect } from 'vitest';
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
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format number with different currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string', () => {
      // Create a date that's definitely in the future to avoid timezone issues
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0); // Set to noon to avoid day boundary issues
      const isoString = tomorrow.toISOString();

      const expected = tomorrow.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      expect(formatDate(isoString)).toBe(expected);
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
        { category: 'FOOD', amount: 100 },
        { category: 'FOOD', amount: 200 },
        { category: 'TRANSPORT', amount: 300 },
      ];
      expect(groupByCategory(expenses)).toEqual({
        FOOD: 300,
        TRANSPORT: 300,
      });
    });
  });

  describe('isValidISODate', () => {
    it('should validate ISO date strings', () => {
      expect(isValidISODate('2024-04-07T00:00:00Z')).toBe(true);
      expect(isValidISODate('invalid-date')).toBe(false);
      expect(isValidISODate('2024-04-07')).toBe(false); // Date without time
      expect(isValidISODate('2024-04-07T00:00:00')).toBe(false); // Missing Z
    });
  });
});
