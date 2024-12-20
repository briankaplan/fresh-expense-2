'use client';

import { db, withRetry } from '@/lib/db';
import { BankTransaction, ProcessedReceipt } from '@/types';
import { Logger } from '@/utils/logger';
import { transactionService } from './transactionService';
import { receiptService } from './receiptService';
import { areMerchantsRelated } from '@/utils/merchantMatching';

interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: Error;
  }>;
  metadata: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    processingTime: number;
  };
}

class BatchServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'BatchServiceError';
  }
}

export const batchService = {
  async createTransactions(
    transactions: Array<Parameters<typeof transactionService.createTransaction>[0]>
  ): Promise<BatchOperationResult<BankTransaction>> {
    const startTime = Date.now();
    const result: BatchOperationResult<BankTransaction> = {
      successful: [],
      failed: [],
      metadata: {
        totalProcessed: transactions.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    try {
      // Process in chunks to avoid overwhelming the database
      const CHUNK_SIZE = 50;
      for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
        const chunk = transactions.slice(i, i + CHUNK_SIZE);
        
        await withRetry(async () => {
          // Use transaction to ensure atomic batch operation
          await db.$transaction(async (prisma) => {
            for (const data of chunk) {
              try {
                const transaction = await prisma.transaction.create({
                  data: {
                    ...data,
                    status: 'pending',
                    hasReceipt: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  },
                  include: {
                    receipts: true,
                    user: {
                      select: {
                        id: true,
                        email: true,
                        name: true
                      }
                    }
                  }
                });
                
                result.successful.push(transaction);
                result.metadata.successCount++;
              } catch (error) {
                result.failed.push({
                  item: data as any,
                  error: error as Error
                });
                result.metadata.failureCount++;
              }
            }
          });
        });

        // Log progress
        Logger.info('Batch progress', {
          processed: Math.min((i + CHUNK_SIZE), transactions.length),
          total: transactions.length,
          successful: result.metadata.successCount,
          failed: result.metadata.failureCount
        });
      }
    } catch (error) {
      Logger.error('Batch operation failed', { error });
      throw new BatchServiceError(
        'Failed to process batch transactions',
        'BATCH_FAILED',
        error
      );
    } finally {
      result.metadata.processingTime = Date.now() - startTime;
    }

    return result;
  },

  async matchReceiptsToTransactions(
    receipts: ProcessedReceipt[],
    transactions: BankTransaction[]
  ): Promise<BatchOperationResult<{ receipt: ProcessedReceipt; transaction: BankTransaction }>> {
    const startTime = Date.now();
    const result: BatchOperationResult<{ receipt: ProcessedReceipt; transaction: BankTransaction }> = {
      successful: [],
      failed: [],
      metadata: {
        totalProcessed: receipts.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    try {
      await withRetry(async () => {
        await db.$transaction(async (prisma) => {
          for (const receipt of receipts) {
            try {
              // Find matching transaction
              const matchingTransaction = transactions.find(tx => 
                this.isReceiptMatch(receipt, tx)
              );

              if (matchingTransaction) {
                // Update transaction with receipt
                await prisma.transaction.update({
                  where: { id: matchingTransaction.id },
                  data: {
                    hasReceipt: true,
                    receiptUrl: receipt.backupUrl,
                    metadata: {
                      ...matchingTransaction.metadata,
                      receiptId: receipt.id,
                      ocrData: receipt.ocrData
                    }
                  }
                });

                result.successful.push({
                  receipt,
                  transaction: matchingTransaction
                });
                result.metadata.successCount++;
              } else {
                throw new Error('No matching transaction found');
              }
            } catch (error) {
              result.failed.push({
                item: { receipt, transaction: null as any },
                error: error as Error
              });
              result.metadata.failureCount++;
            }
          }
        });
      });
    } catch (error) {
      Logger.error('Batch matching failed', { error });
      throw new BatchServiceError(
        'Failed to match receipts to transactions',
        'MATCH_FAILED',
        error
      );
    } finally {
      result.metadata.processingTime = Date.now() - startTime;
    }

    return result;
  },

  private isReceiptMatch(receipt: ProcessedReceipt, transaction: BankTransaction): boolean {
    try {
      // 1. Amount matching (with small tolerance for rounding)
      const amountTolerance = 0.01;
      const amountMatches = Math.abs(receipt.ocrData.total - Math.abs(transaction.amount)) <= amountTolerance;
      if (!amountMatches) return false;

      // 2. Date matching (within 3 days)
      const receiptDate = new Date(receipt.ocrData.date);
      const transactionDate = new Date(transaction.date);
      const daysDifference = Math.abs(
        (receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDifference > 3) return false;

      // 3. Merchant name matching
      const merchantMatches = areMerchantsRelated(
        receipt.ocrData.merchant,
        transaction.description
      );
      if (!merchantMatches) return false;

      // Calculate confidence score
      let confidence = 0;
      
      // Amount exact match gives highest weight
      confidence += amountMatches ? 0.5 : 0;
      
      // Date proximity
      if (daysDifference === 0) {
        confidence += 0.3;
      } else {
        confidence += 0.3 * (1 - daysDifference / 3);
      }
      
      // Merchant name match
      confidence += merchantMatches ? 0.2 : 0;

      // Consider it a match if confidence is high enough
      return confidence >= 0.7;
    } catch (error) {
      Logger.error('Error in receipt matching', {
        error,
        receipt: receipt.id,
        transaction: transaction.id
      });
      return false;
    }
  },

  private async findBestMatch(
    receipt: ProcessedReceipt,
    transactions: BankTransaction[]
  ): Promise<{ transaction: BankTransaction; confidence: number } | null> {
    const matches = transactions
      .map(transaction => ({
        transaction,
        confidence: this.calculateMatchConfidence(receipt, transaction)
      }))
      .filter(match => match.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);

    return matches.length > 0 ? matches[0] : null;
  },

  private calculateMatchConfidence(
    receipt: ProcessedReceipt,
    transaction: BankTransaction
  ): number {
    try {
      let confidence = 0;
      let weights = {
        amount: 0.5,
        date: 0.3,
        merchant: 0.2
      };

      // Amount matching
      const amountDiff = Math.abs(receipt.ocrData.total - Math.abs(transaction.amount));
      if (amountDiff <= 0.01) {
        confidence += weights.amount;
      } else if (amountDiff <= 0.1) {
        confidence += weights.amount * 0.5;
      }

      // Date matching
      const daysDiff = Math.abs(
        (new Date(receipt.ocrData.date).getTime() - new Date(transaction.date).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === 0) {
        confidence += weights.date;
      } else if (daysDiff <= 3) {
        confidence += weights.date * (1 - daysDiff / 3);
      }

      // Merchant matching
      if (areMerchantsRelated(receipt.ocrData.merchant, transaction.description)) {
        confidence += weights.merchant;
      }

      return confidence;
    } catch (error) {
      Logger.error('Error calculating match confidence', {
        error,
        receipt: receipt.id,
        transaction: transaction.id
      });
      return 0;
    }
  },

  async validateBatchOperation<T>(
    items: T[],
    validator: (item: T) => Promise<boolean>
  ): Promise<{
    valid: T[];
    invalid: Array<{ item: T; reason: string }>;
  }> {
    const result = {
      valid: [] as T[],
      invalid: [] as Array<{ item: T; reason: string }>
    };

    for (const item of items) {
      try {
        const isValid = await validator(item);
        if (isValid) {
          result.valid.push(item);
        } else {
          result.invalid.push({
            item,
            reason: 'Failed validation'
          });
        }
      } catch (error) {
        result.invalid.push({
          item,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  },

  async deleteTransactions(ids: string[]): Promise<BatchOperationResult<string>> {
    const startTime = Date.now();
    const result: BatchOperationResult<string> = {
      successful: [],
      failed: [],
      metadata: {
        totalProcessed: ids.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    try {
      await withRetry(async () => {
        await db.$transaction(async (prisma) => {
          // First delete associated receipts
          await prisma.receipt.deleteMany({
            where: { transactionId: { in: ids } }
          });

          // Then delete transactions
          await prisma.transaction.deleteMany({
            where: { id: { in: ids } }
          });
        });

        result.successful = ids;
        result.metadata.successCount = ids.length;
      });
    } catch (error) {
      Logger.error('Batch deletion failed', { error });
      result.failed = ids.map(id => ({
        item: id,
        error: error as Error
      }));
      result.metadata.failureCount = ids.length;
    } finally {
      result.metadata.processingTime = Date.now() - startTime;
    }

    return result;
  }
}; 