import type { TellerAccount, TellerTransaction, Column, ExtendedUser } from '../teller.types';
import { UserRole, UserStatus, ExpenseStatus, ExpenseCategory } from './enums';
import { Receipt } from '../schemas/receipt.schema';

export { UserRole, UserStatus, ExpenseStatus, ExpenseCategory };

export interface Amount {
  amount: number;
  currency: string;
}

export interface Metadata {
  project?: string;
  department?: string;
  costCenter?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  currency?: string;
  language?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: Amount;
  date: Date;
  description: string;
  category?: string;
  merchant?: string;
  status: string;
  metadata?: Metadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: any;
}

/**
 * Utility type to convert TellerTransaction to our internal Transaction format
 */
export type TellerTransactionToTransaction = Omit<Transaction, 'id'> & {
  tellerId: string;
  tellerAccountId: string;
};

/**
 * Utility type for transaction creation
 */
export type CreateTransactionDto = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Utility type for transaction updates
 */
export type UpdateTransactionDto = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>;

export type {
  TellerAccount,
  TellerTransaction,
  Column,
  ExtendedUser,
  Receipt,
};
