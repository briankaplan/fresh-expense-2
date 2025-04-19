import type { Transaction } from "@fresh-expense/types";
export interface SyncStatus {
  lastSync: string;
  status: "success" | "error" | "in_progress";
  error?: string;
  accountsSynced?: number;
  transactionsProcessed?: number;
}
export interface SyncProgress {
  current: number;
  total: number;
  status: string;
  accountId?: string;
}
declare const transactionSyncService: {
  getSyncStatus(): Promise<SyncStatus>;
  startSync(): Promise<void>;
  getPendingTransactions(): Promise<Transaction[]>;
  getSyncProgress(): Promise<SyncProgress>;
  cancelSync(): Promise<void>;
  retryFailedSync(): Promise<void>;
};
export default transactionSyncService;
//# sourceMappingURL=transaction-sync.service.d.ts.map
