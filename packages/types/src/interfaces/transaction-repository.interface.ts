import type { Transaction } from "@fresh-expense/types";
import type { TransactionFilters, TransactionSearchQuery } from "../lib/transaction-types";
import type { Transaction as TransactionSchema } from "../schemas/transaction.schema";

export interface ITransactionRepository {
  // Core CRUD operations
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(filters?: TransactionFilters): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  findByCategory(category: string): Promise<Transaction[]>;
  findByMerchant(merchantName: string, userId: string): Promise<Transaction[]>;

  // Advanced queries
  search(query: TransactionSearchQuery): Promise<{
    items: Transaction[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  // Aggregation operations
  getTotalByCategory(
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      category: string;
      total: number;
      count: number;
    }>
  >;

  getMerchantSummary(merchantName: string): Promise<{
    totalSpent: number;
    averageAmount: number;
    transactionCount: number;
    lastTransaction: Date;
  }>;

  // Batch operations
  createMany(transactions: Partial<Transaction>[]): Promise<Transaction[]>;
  updateMany(updates: Array<{ id: string; transaction: Partial<Transaction> }>): Promise<number>;
  deleteMany(ids: string[]): Promise<number>;

  // Utility operations
  exists(id: string): Promise<boolean>;
  count(filters?: TransactionFilters): Promise<number>;
  distinct(field: keyof Transaction): Promise<any[]>;

  // Index operations
  ensureIndexes(): Promise<void>;

  // Cleanup operations
  deleteOlderThan(date: Date): Promise<number>;
  archiveTransactions(beforeDate: Date): Promise<number>;

  findByMerchantAndDateRange(
    merchantName: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionSchema[]>;

  getMerchantStats(
    merchantName: string,
    userId: string,
  ): Promise<{
    transactionCount: number;
    totalAmount: number;
    averageAmount: number;
    categories: Record<string, number>;
    tags: string[];
  }>;
}
