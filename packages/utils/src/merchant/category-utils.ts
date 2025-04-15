import { TransactionCategory } from '../types/transaction.types';

export const TRANSACTION_CATEGORIES = {
  FOOD_AND_DINING: 'Food & Dining',
  GROCERIES: 'Groceries',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  TRAVEL: 'Travel',
  TRANSPORTATION: 'Transportation',
  UTILITIES: 'Utilities',
  HOUSING: 'Housing',
  HEALTHCARE: 'Healthcare',
  INSURANCE: 'Insurance',
  PERSONAL_CARE: 'Personal Care',
  EDUCATION: 'Education',
  GIFTS_AND_DONATIONS: 'Gifts & Donations',
  BUSINESS_SERVICES: 'Business Services',
  TAXES: 'Taxes',
  INVESTMENTS: 'Investments',
  INCOME: 'Income',
  TRANSFER: 'Transfer',
  FEES_AND_CHARGES: 'Fees & Charges',
  OTHER: 'Other',
} as const;

export const VALID_CATEGORIES = new Set(Object.keys(TRANSACTION_CATEGORIES));

/**
 * Check if a category is valid
 */
export function isValidCategory(category: string): category is TransactionCategory {
  return Object.keys(TRANSACTION_CATEGORIES).includes(category);
}

/**
 * Normalize a category string to a valid transaction category
 */
export function normalizeCategory(category: string): TransactionCategory {
  const normalized = category.toUpperCase().replace(/[^A-Z_]/g, '_');
  return isValidCategory(normalized) ? (normalized as TransactionCategory) : 'OTHER';
}

/**
 * Get the display name for a transaction category
 */
export function getCategoryDisplayName(category: TransactionCategory): string {
  return TRANSACTION_CATEGORIES[category];
}

/**
 * Get a category from its display name
 */
export function getCategoryFromDisplayName(displayName: string): TransactionCategory {
  const entry = Object.entries(TRANSACTION_CATEGORIES).find(([_, value]) => value === displayName);
  return entry ? (entry[0] as TransactionCategory) : 'OTHER';
}
