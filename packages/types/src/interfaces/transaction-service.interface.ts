import { Transaction } from '@fresh-expense/types';

import { CreateTransactionDto, UpdateTransactionDto } from '../dto/transaction.dto';
import {
  TransactionFilters,
  TransactionSearchQuery,
  TransactionExportOptions,
  TransactionStatistics,
} from '../lib/transaction-types';

export interface TransactionService {
  createTransaction(data: CreateTransactionDto): Promise<Transaction>;
  updateTransaction(id: string, data: UpdateTransactionDto): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction>;
  getTransactions(filters: TransactionFilters): Promise<Transaction[]>;
  searchTransactions(query: TransactionSearchQuery): Promise<Transaction[]>;
  exportTransactions(options: TransactionExportOptions): Promise<void>;
  getTransactionStatistics(): Promise<TransactionStatistics>;
}
