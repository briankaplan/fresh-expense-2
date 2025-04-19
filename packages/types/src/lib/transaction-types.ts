import { TransactionStatus, TransactionType } from "../constants/transaction.constants";
import type { Transaction } from "../interfaces/transaction.interface";

export { TransactionStatus, TransactionType };

/**
 * Type for transaction amount operations
 */
export interface TransactionAmount {
  value: number;
  currency: string;
}

/**
 * Type for transaction location data
 */
export interface TransactionLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Type for transaction merchant data
 */
export interface TransactionMerchant {
  name: string;
  category?: string;
  website?: string;
}

/**
 * Type for transaction filters
 */
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  categories?: string[];
  merchants?: string[];
  types?: string[];
  statuses?: string[];
  sources?: string[];
  tags?: string[];
}

/**
 * Type for base transaction data used in summaries and reports
 */
export interface BaseTransactionData {
  id: string;
  accountId: string;
  amount: TransactionAmount;
  date: Date;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  category: string;
  merchant: TransactionMerchant;
  location?: TransactionLocation;
  runningBalance?: TransactionAmount;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for transaction summary
 */
export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: TransactionAmount;
  byCategory: Record<
    string,
    {
      count: number;
      amount: TransactionAmount;
    }
  >;
  byMerchant: Record<
    string,
    {
      count: number;
      amount: TransactionAmount;
    }
  >;
  byType: Record<
    string,
    {
      count: number;
      amount: TransactionAmount;
    }
  >;
}

/**
 * Type for transaction batch operations
 */
export interface TransactionBatchOperation {
  transactionIds: string[];
  update?: Partial<any>;
  delete?: boolean;
}

/**
 * Type for transaction search query
 */
export interface TransactionSearchQuery {
  query: string;
  filters?: TransactionFilters;
  includeMetadata?: boolean;
  includeMerchantDetails?: boolean;
  includeLocation?: boolean;
}

/**
 * Type for transaction export options
 */
export interface TransactionExportOptions {
  format: "csv" | "json" | "pdf";
  filters?: TransactionFilters;
  includeMetadata?: boolean;
  includeMerchantDetails?: boolean;
  includeLocation?: boolean;
  dateFormat?: string;
  currencyFormat?: string;
}

/**
 * Type for recurring transaction pattern
 */
export interface RecurringTransactionPattern {
  merchantName: string;
  approximateAmount: TransactionAmount;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  month?: number;
  confidence: number;
  lastOccurrence: Date;
  nextPredictedDate: Date;
  transactions: string[]; // Array of transaction IDs
}

/**
 * Type for transaction category rules
 */
export interface TransactionCategoryRule {
  id: string;
  conditions: {
    field: keyof Transaction;
    operator: "equals" | "contains" | "startsWith" | "endsWith" | "regex";
    value: string;
  }[];
  category: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for transaction statistics
 */
export interface TransactionStatistics {
  daily: {
    date: Date;
    count: number;
    amount: TransactionAmount;
  }[];
  weekly: {
    startDate: Date;
    endDate: Date;
    count: number;
    amount: TransactionAmount;
  }[];
  monthly: {
    month: number;
    year: number;
    count: number;
    amount: TransactionAmount;
  }[];
}
