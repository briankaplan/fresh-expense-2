import { describe, it, expect } from 'vitest';
import {
  validateTellerTransaction,
  validateTransaction,
  mapTellerToTransaction,
  isTransaction,
  isTellerTransaction,
} from './transaction-mappers';
import type { TellerTransaction } from '../index';
import { Transaction } from '@fresh-expense/types';

describe('Transaction Validation and Mapping', () => {
  const validTellerTx: TellerTransaction = {
    id: 'teller-123',
    accountId: 'acc-123',
    date: new Date('2024-01-01'),
    description: {
      original: 'Coffee Shop',
      clean: 'COFFEE SHOP INC',
      simple: 'Coffee Shop',
    },
    amount: {
      value: 10.5,
      currency: 'USD',
    },
    running_balance: {
      value: 100.0,
      currency: 'USD',
    },
    type: 'debit',
    status: 'matched',
    merchant: {
      name: 'Coffee Shop Inc',
      category: 'food_and_dining',
      website: 'https://coffeeshop.com',
    },
    enrichment: {
      category: 'food_and_dining',
      location: {
        address: '123 Coffee St',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        postal_code: '98101',
        latitude: 47.6062,
        longitude: -122.3321,
      },
      paymentMethod: 'credit_card',
    },
  };

  const validTransaction: Transaction = {
    id: 'tx-123',
    accountId: 'acc-123',
    date: new Date('2024-01-01'),
    description: 'Coffee Shop',
    cleanDescription: 'COFFEE SHOP INC',
    amount: {
      value: 10.5,
      currency: 'USD',
    },
    runningBalance: {
      value: 100.0,
      currency: 'USD',
    },
    category: 'food_and_dining',
    merchant: {
      name: 'Coffee Shop Inc',
      category: 'food_and_dining',
      website: 'https://coffeeshop.com',
    },
    status: 'matched',
    type: 'expense',
    source: 'teller',
    location: {
      address: '123 Coffee St',
      city: 'Seattle',
      region: 'WA',
      country: 'US',
      postalCode: '98101',
      coordinates: {
        latitude: 47.6062,
        longitude: -122.3321,
      },
    },
    metadata: {
      paymentMethod: 'credit_card',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('validateTellerTransaction', () => {
    it('should validate a valid Teller transaction', () => {
      const errors = validateTellerTransaction(validTellerTx);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid Teller transaction', () => {
      const invalidTx = { ...validTellerTx, id: undefined };
      const errors = validateTellerTransaction(invalidTx);
      expect(errors).toContain('Missing transaction ID');
    });
  });

  describe('validateTransaction', () => {
    it('should validate a valid transaction', () => {
      const errors = validateTransaction(validTransaction);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid transaction', () => {
      const invalidTx = { ...validTransaction, amount: undefined };
      const errors = validateTransaction(invalidTx);
      expect(errors).toContain('Missing amount value');
      expect(errors).toContain('Missing amount currency');
    });
  });

  describe('mapTellerToTransaction', () => {
    it('should correctly map Teller transaction to internal format', () => {
      const mapped = mapTellerToTransaction(validTellerTx);

      expect(mapped.accountId).toBe(validTellerTx.accountId);
      expect(mapped.description).toBe(validTellerTx.description.original);
      expect(mapped.cleanDescription).toBe(validTellerTx.description.clean);
      expect(mapped.amount).toEqual(validTellerTx.amount);
      expect(mapped.runningBalance).toEqual(validTellerTx.running_balance);
      expect(mapped.category).toBe(validTellerTx.enrichment?.category);
      expect(mapped.merchant).toEqual(validTellerTx.merchant);
      expect(mapped.source).toBe('teller');
      expect(mapped.tellerId).toBe(validTellerTx.id);
      expect(mapped.tellerAccountId).toBe(validTellerTx.accountId);
    });

    it('should handle missing optional fields', () => {
      const minimalTx: TellerTransaction = {
        id: 'teller-123',
        accountId: 'acc-123',
        date: new Date('2024-01-01'),
        description: {
          original: 'Transaction',
        },
        amount: {
          value: 10.5,
          currency: 'USD',
        },
        type: 'debit',
        status: 'matched',
      };

      const mapped = mapTellerToTransaction(minimalTx);
      expect(mapped.merchant.name).toBe(minimalTx.description.original);
      expect(mapped.category).toBe('uncategorized');
      expect(mapped.location).toBeUndefined();
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify valid Transaction', () => {
      expect(isTransaction(validTransaction)).toBe(true);
      expect(isTransaction({ ...validTransaction, id: undefined })).toBe(false);
    });

    it('should correctly identify valid TellerTransaction', () => {
      expect(isTellerTransaction(validTellerTx)).toBe(true);
      expect(isTellerTransaction({ ...validTellerTx, id: undefined })).toBe(false);
    });
  });
});
