import api from './api';
import { TellerAccount, TellerTransaction, ApiError } from '@fresh-expense/types';

export interface TellerWebhookEvent {
  type: string;
  data: {
    accountId: string;
    transactionId: string;
  };
}

const tellerService = {
  async getAccounts(): Promise<TellerAccount[]> {
    try {
      const response = await api.get<TellerAccount[]>('/teller/accounts');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch Teller accounts');
    }
  },

  async getAccount(accountId: string): Promise<TellerAccount> {
    try {
      const response = await api.get<TellerAccount>(`/teller/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch Teller account');
    }
  },

  async syncTransactions(accountId: string): Promise<void> {
    try {
      await api.post(`/teller/accounts/${accountId}/sync`);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to sync Teller transactions');
    }
  },

  async getTransactions(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TellerTransaction[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get<TellerTransaction[]>(
        `/teller/accounts/${accountId}/transactions?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch Teller transactions');
    }
  },

  async handleWebhook(event: TellerWebhookEvent): Promise<void> {
    try {
      // Verify webhook signature
      const signature = event.data.timestamp;
      if (signature !== import.meta.env.VITE_TELLER_WEBHOOK_SECRET) {
        throw new Error('Invalid webhook signature');
      }

      await api.post('/teller/webhook', event);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to process Teller webhook');
    }
  },

  async disconnectAccount(accountId: string): Promise<void> {
    try {
      await api.delete(`/teller/accounts/${accountId}`);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to disconnect Teller account');
    }
  },
};

export default tellerService;
