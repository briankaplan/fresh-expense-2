import type { Transaction } from "@fresh-expense/types";
/**
 * Custom error types for transaction processing
 */
export declare class TransactionValidationError extends Error {
  constructor(message: string);
}
export declare class TransactionMappingError extends Error {
  constructor(message: string);
}
/**
 * Raw transaction data from Teller API
 */
export interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  details: {
    category: string;
    counterparty?: {
      name: string;
      type: string;
    };
    processing_status: string;
  };
  running_balance: string;
  status: string;
  type: string;
  amount: string;
  links: {
    self: string;
    account: string;
  };
}
/**
 * Intermediate state during AI processing
 */
export interface AIProcessedData {
  category: CategoryResult;
  description?: string;
  merchant?: string;
  isRecurring?: boolean;
  processedAt: Date;
}
/**
 * Predefined transaction categories
 */
export declare const TRANSACTION_CATEGORIES: {
  readonly SOFTWARE_SUBSCRIPTIONS: "Software Subscriptions";
  readonly TRAVEL_RIDESHARE: "Travel Costs - Cab/Uber/Bus Fare";
  readonly TRAVEL_HOTELS: "Travel Costs - Hotel";
  readonly TRAVEL_CAR: "Travel Costs - Gas/Rental Car";
  readonly TRAVEL_AIRFARE: "Travel Costs - Airfare";
  readonly CLIENT_MEALS: "DH: BD: Client Business Meals";
  readonly COMPANY_MEALS: "Company Meetings and Meals";
  readonly PERSONAL_MEALS: "Meals (Non-Business Related)";
  readonly OFFICE_SUPPLIES: "Office Supplies";
  readonly ADVERTISING: "BD: Advertising & Promotion";
  readonly HARDWARE: "Hardware & Equipment";
  readonly CONFERENCE: "Conference & Training Expenses";
  readonly UNCATEGORIZED: "Uncategorized";
};
/**
 * Category result from categorization
 */
export interface CategoryResult {
  name: keyof typeof TRANSACTION_CATEGORIES;
  confidence: number;
  source: string;
  details?: Record<string, any>;
}
/**
 * Category definitions with keywords and patterns
 */
export declare const CATEGORY_DEFINITIONS: Array<{
  name: keyof typeof TRANSACTION_CATEGORIES;
  description: string;
  keywords: string[];
  patterns?: RegExp[];
}>;
/**
 * Transaction processing status
 */
export type TransactionStatus = "pending" | "processed" | "failed" | "rejected";
/**
 * Receipt patterns for text extraction
 */
export declare const RECEIPT_PATTERNS: {
  itemLine: RegExp;
  withQuantity: RegExp;
  subtotal: RegExp;
  total: RegExp;
  salesTax: RegExp;
  tip: RegExp;
  subscriptionPeriod: RegExp;
  nextBilling: RegExp;
};
/**
 * Validation rules for transactions
 */
export declare const transactionValidationRules: {
  amount: {
    min: number;
    max: number;
  };
  date: {
    minDate: Date;
    maxDate: Date;
  };
  description: {
    minLength: number;
    maxLength: number;
  };
};
/**
 * Validates a transaction amount
 */
export declare const validateTransactionAmount: (amount: number) => boolean;
/**
 * Validates a transaction date
 */
export declare const validateTransactionDate: (date: Date) => boolean;
/**
 * Maps a Teller transaction to our Transaction model
 */
export declare const mapTellerToTransaction: (
  tellerTx: TellerTransaction,
  companyId: string,
  userId: string,
  aiData?: AIProcessedData,
) => Partial<Transaction>;
/**
 * Updates a transaction with AI-processed data
 */
export declare const updateTransactionWithAI: (
  transaction: Transaction,
  aiData: AIProcessedData,
) => Transaction;
/**
 * Validates if a transaction can be linked to a receipt
 */
export declare const canLinkReceipt: (transaction: Transaction) => boolean;
/**
 * Links a receipt to a transaction
 */
export declare const linkReceiptToTransaction: (
  transaction: Transaction,
  receiptId: string,
) => Transaction;
/**
 * Type guard for Teller transactions
 */
export declare const isTellerTransaction: (obj: any) => obj is TellerTransaction;
/**
 * Add confidence to Transaction interface extension
 */
export interface TransactionWithAI extends Transaction {
  confidence?: number;
}
/**
 * Enhanced mapping function with validation and categorization
 */
export declare const mapAndValidateTellerTransaction: (
  tellerTx: TellerTransaction,
  companyId: string,
  userId: string,
  aiData?: AIProcessedData,
) => Partial<Transaction>;
/**
 * Utility function to detect duplicate transactions
 */
export declare const isDuplicateTransaction: (
  transaction: Transaction,
  existingTransactions: Transaction[],
) => boolean;
/**
 * Utility function to format transaction amount for display
 */
export declare const formatTransactionAmount: (amount: number, currency?: string) => string;
/**
 * Utility function to categorize transaction type
 */
export declare const categorizeTransactionType: (
  transaction: Transaction,
) => "expense" | "income" | "transfer";
/**
 * Utility function to get transaction status label
 */
export declare const getTransactionStatusLabel: (status: TransactionStatus) => string;
/**
 * Utility function to check if a transaction needs review
 */
export declare const needsReview: (transaction: TransactionWithAI) => boolean;
//# sourceMappingURL=teller.d.ts.map
