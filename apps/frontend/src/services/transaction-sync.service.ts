import api from './api';
import { ApiError, Transaction } from '@fresh-expense/types';

export interface SyncStatus {
  lastSync: string;
  status: 'success' | 'error' | 'in_progress';
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

const transactionSyncService = {
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await api.get<SyncStatus>('/transactions/sync/status');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to get sync status');
    }
  },

  async startSync(): Promise<void> {
    try {
      await api.post('/transactions/sync/start');
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to start sync');
    }
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>('/transactions/pending');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to get pending transactions');
    }
  },

  async getSyncProgress(): Promise<SyncProgress> {
    try {
      const response = await api.get<SyncProgress>('/transactions/sync/progress');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to get sync progress');
    }
  },

  async cancelSync(): Promise<void> {
    try {
      await api.post('/transactions/sync/cancel');
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to cancel sync');
    }
  },

  async retryFailedSync(): Promise<void> {
    try {
      await api.post('/transactions/sync/retry');
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to retry sync');
    }
  },
};

export default transactionSyncService;
