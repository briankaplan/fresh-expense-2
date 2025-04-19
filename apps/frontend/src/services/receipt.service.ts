import { api } from './api';
import { Receipt } from '@fresh-expense/types';

export class ReceiptService {
  static async uploadReceipt(transactionId: string, file: File): Promise<Receipt> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/receipts/${transactionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  static async getReceipt(transactionId: string): Promise<Receipt> {
    const response = await api.get(`/receipts/${transactionId}`);
    return response.data;
  }

  static async deleteReceipt(transactionId: string): Promise<void> {
    await api.delete(`/receipts/${transactionId}`);
  }

  static async downloadReceipt(receiptId: string): Promise<Blob> {
    const response = await api.get(`/receipts/${receiptId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  static async updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<Receipt> {
    const response = await api.patch(`/receipts/${receiptId}`, updates);
    return response.data;
  }

  static async linkTransaction(receiptId: string, transactionId: string): Promise<Receipt> {
    const response = await api.post(`/receipts/${receiptId}/link`, { transactionId });
    return response.data;
  }

  static async unlinkTransaction(receiptId: string): Promise<Receipt> {
    const response = await api.post(`/receipts/${receiptId}/unlink`);
    return response.data;
  }
}
