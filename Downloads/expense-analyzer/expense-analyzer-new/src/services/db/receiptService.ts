'use client';

import { db, withRetry } from '@/lib/db';
import { ProcessedReceipt, OCRResult } from '@/types';
import { Logger } from '@/utils/logger';

interface CreateReceiptData {
  transactionId: string;
  userId: string;
  url: string;
  ocrData?: OCRResult;
  metadata?: Record<string, any>;
}

interface UpdateReceiptData {
  url?: string;
  ocrData?: OCRResult;
  metadata?: Record<string, any>;
  status?: 'pending' | 'processed' | 'error';
}

class ReceiptServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ReceiptServiceError';
  }
}

export const receiptService = {
  async createReceipt(data: CreateReceiptData) {
    try {
      return await withRetry(async () => {
        // Check if receipt already exists for transaction
        const existingReceipt = await db.receipt.findFirst({
          where: { transactionId: data.transactionId }
        });

        if (existingReceipt) {
          throw new ReceiptServiceError(
            'Receipt already exists for this transaction',
            'DUPLICATE_RECEIPT',
            { transactionId: data.transactionId }
          );
        }

        // Create receipt with transaction link
        const receipt = await db.receipt.create({
          data: {
            ...data,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            transaction: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        });

        Logger.info('Receipt created', {
          receiptId: receipt.id,
          transactionId: data.transactionId
        });

        return receipt;
      });
    } catch (error) {
      Logger.error('Failed to create receipt', { error, data });
      throw new ReceiptServiceError(
        'Failed to create receipt',
        'CREATE_FAILED',
        error
      );
    }
  },

  async getReceipt(id: string) {
    try {
      const receipt = await withRetry(async () => 
        db.receipt.findUnique({
          where: { id },
          include: {
            transaction: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        })
      );

      if (!receipt) {
        throw new ReceiptServiceError(
          'Receipt not found',
          'NOT_FOUND',
          { id }
        );
      }

      return receipt;
    } catch (error) {
      Logger.error('Failed to get receipt', { error, id });
      throw new ReceiptServiceError(
        'Failed to get receipt',
        'GET_FAILED',
        error
      );
    }
  },

  async updateReceipt(id: string, data: UpdateReceiptData) {
    try {
      return await withRetry(async () => {
        const receipt = await db.receipt.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          },
          include: {
            transaction: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        });

        Logger.info('Receipt updated', {
          receiptId: id,
          updates: Object.keys(data)
        });

        return receipt;
      });
    } catch (error) {
      Logger.error('Failed to update receipt', { error, id, data });
      throw new ReceiptServiceError(
        'Failed to update receipt',
        'UPDATE_FAILED',
        error
      );
    }
  },

  async deleteReceipt(id: string) {
    try {
      return await withRetry(async () => {
        const receipt = await db.receipt.delete({
          where: { id }
        });

        Logger.info('Receipt deleted', { receiptId: id });
        return receipt;
      });
    } catch (error) {
      Logger.error('Failed to delete receipt', { error, id });
      throw new ReceiptServiceError(
        'Failed to delete receipt',
        'DELETE_FAILED',
        error
      );
    }
  },

  async getReceiptsForTransaction(transactionId: string) {
    try {
      return await withRetry(async () =>
        db.receipt.findMany({
          where: { transactionId },
          orderBy: { createdAt: 'desc' },
          include: {
            transaction: true
          }
        })
      );
    } catch (error) {
      Logger.error('Failed to get receipts for transaction', { error, transactionId });
      throw new ReceiptServiceError(
        'Failed to get receipts for transaction',
        'GET_FAILED',
        error
      );
    }
  },

  async getUnprocessedReceipts() {
    try {
      return await withRetry(async () =>
        db.receipt.findMany({
          where: { status: 'pending' },
          orderBy: { createdAt: 'asc' },
          include: {
            transaction: true
          }
        })
      );
    } catch (error) {
      Logger.error('Failed to get unprocessed receipts', { error });
      throw new ReceiptServiceError(
        'Failed to get unprocessed receipts',
        'GET_FAILED',
        error
      );
    }
  },

  async markReceiptAsProcessed(id: string, ocrData: OCRResult) {
    return this.updateReceipt(id, {
      ocrData,
      status: 'processed'
    });
  },

  async markReceiptAsError(id: string, error: Error) {
    return this.updateReceipt(id, {
      status: 'error',
      metadata: {
        error: {
          message: error.message,
          stack: error.stack
        }
      }
    });
  }
}; 