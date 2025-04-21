// Internal modules
import { ExpenseCategory, ExpenseStatus, UserRole, UserStatus } from "./enums";
import type { Receipt } from "../schemas/receipt.schema";
import type { Column, ExtendedUser, TellerAccount, TellerTransaction } from "../teller.types";

export { UserRole, UserStatus, ExpenseStatus, ExpenseCategory };

export interface Amount {
  value: number;
  currency: string;
}

export interface Location {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Merchant {
  name: string;
  category?: string;
  website?: string;
}

export interface Metadata {
  project?: string;
  department?: string;
  costCenter?: string;
  paymentMethod?: string;
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
  theme?: "light" | "dark";
  notifications?: {
    email: {
      enabled: boolean;
      frequency: string;
      types: string[];
    };
    push: {
      enabled: boolean;
      types: string[];
    };
    inApp: {
      enabled: boolean;
      types: string[];
    };
  };
  currency?: string;
  language?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: Amount;
  date: Date;
  description: string;
  cleanDescription?: string;
  category?: ExpenseCategory;
  merchant: Merchant;
  status: "pending" | "posted" | "canceled" | "matched";
  type: "expense" | "income" | "transfer";
  source: "teller" | "manual" | "import";
  location?: Location;
  metadata?: Metadata;
  runningBalance?: Amount;
  createdAt: Date;
  updatedAt: Date;
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
  direction: "asc" | "desc";
}

export interface FilterOptions {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "regex";
  value: any;
}

/**
 * Utility type to convert TellerTransaction to our internal Transaction format
 */
export type TellerTransactionToTransaction = Omit<Transaction, "id" | "userId"> & {
  tellerId: string;
  tellerAccountId: string;
};

/**
 * Utility type for transaction creation
 */
export type CreateTransactionDto = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

/**
 * Utility type for transaction updates
 */
export type UpdateTransactionDto = Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>;

export type { TellerAccount, TellerTransaction, Column, ExtendedUser, Receipt };
