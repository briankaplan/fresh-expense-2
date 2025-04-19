"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const transaction_mappers_1 = require("./transaction-mappers");
(0, vitest_1.describe)('Transaction Validation and Mapping', () => {
    const validTellerTx = {
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
    const validTransaction = {
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
            state: 'WA',
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
    (0, vitest_1.describe)('validateTellerTransaction', () => {
        (0, vitest_1.it)('should validate a valid Teller transaction', () => {
            const errors = (0, transaction_mappers_1.validateTellerTransaction)(validTellerTx);
            (0, vitest_1.expect)(errors).toHaveLength(0);
        });
        (0, vitest_1.it)('should return errors for invalid Teller transaction', () => {
            const invalidTx = { ...validTellerTx, id: undefined };
            const errors = (0, transaction_mappers_1.validateTellerTransaction)(invalidTx);
            (0, vitest_1.expect)(errors).toContain('Missing transaction ID');
        });
    });
    (0, vitest_1.describe)('validateTransaction', () => {
        (0, vitest_1.it)('should validate a valid transaction', () => {
            const errors = (0, transaction_mappers_1.validateTransaction)(validTransaction);
            (0, vitest_1.expect)(errors).toHaveLength(0);
        });
        (0, vitest_1.it)('should return errors for invalid transaction', () => {
            const invalidTx = { ...validTransaction, amount: undefined };
            const errors = (0, transaction_mappers_1.validateTransaction)(invalidTx);
            (0, vitest_1.expect)(errors).toContain('Missing amount value');
            (0, vitest_1.expect)(errors).toContain('Missing amount currency');
        });
    });
    (0, vitest_1.describe)('mapTellerToTransaction', () => {
        (0, vitest_1.it)('should correctly map Teller transaction to internal format', () => {
            const mapped = (0, transaction_mappers_1.mapTellerToTransaction)(validTellerTx);
            (0, vitest_1.expect)(mapped.accountId).toBe(validTellerTx.accountId);
            (0, vitest_1.expect)(mapped.description).toBe(validTellerTx.description.original);
            (0, vitest_1.expect)(mapped.cleanDescription).toBe(validTellerTx.description.clean);
            (0, vitest_1.expect)(mapped.amount).toEqual(validTellerTx.amount);
            (0, vitest_1.expect)(mapped.runningBalance).toEqual(validTellerTx.running_balance);
            (0, vitest_1.expect)(mapped.category).toBe(validTellerTx.enrichment?.category);
            (0, vitest_1.expect)(mapped.merchant).toEqual(validTellerTx.merchant);
            (0, vitest_1.expect)(mapped.source).toBe('teller');
            (0, vitest_1.expect)(mapped.tellerId).toBe(validTellerTx.id);
            (0, vitest_1.expect)(mapped.tellerAccountId).toBe(validTellerTx.accountId);
        });
        (0, vitest_1.it)('should handle missing optional fields', () => {
            const minimalTx = {
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
            const mapped = (0, transaction_mappers_1.mapTellerToTransaction)(minimalTx);
            (0, vitest_1.expect)(mapped.merchant.name).toBe(minimalTx.description.original);
            (0, vitest_1.expect)(mapped.category).toBe('uncategorized');
            (0, vitest_1.expect)(mapped.location).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('Type Guards', () => {
        (0, vitest_1.it)('should correctly identify valid Transaction', () => {
            (0, vitest_1.expect)((0, transaction_mappers_1.isTransaction)(validTransaction)).toBe(true);
            (0, vitest_1.expect)((0, transaction_mappers_1.isTransaction)({ ...validTransaction, id: undefined })).toBe(false);
        });
        (0, vitest_1.it)('should correctly identify valid TellerTransaction', () => {
            (0, vitest_1.expect)((0, transaction_mappers_1.isTellerTransaction)(validTellerTx)).toBe(true);
            (0, vitest_1.expect)((0, transaction_mappers_1.isTellerTransaction)({ ...validTellerTx, id: undefined })).toBe(false);
        });
    });
});
//# sourceMappingURL=transaction-mappers.spec.js.map