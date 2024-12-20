'use client';

import { BaseService, BaseServiceError } from './baseService';
import { BankTransaction, Expense, ProcessedReceipt } from '@/types';
import { CacheService } from '../cache/cacheService';
import { MetricsService } from '../metrics/metricsService';
import { PatternRecognitionService } from '../ml/patternRecognition';

interface CreateTransactionData {
  date: Date;
  amount: number;
  description: string;
  merchant: string;
  category: string;
  type: 'personal' | 'business';
  userId: string;
  metadata?: Record<string, any>;
}

interface TransactionMatchData {
  receiptUrl: string;
  matchedExpenseId: string;
  matchConfidence: number;
  notes?: string;
}

interface TransactionQueryOptions {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: string;
  hasReceipt?: boolean;
  isReconciled?: boolean;
  limit?: number;
  offset?: number;
}

export class TransactionService extends BaseService {
  private cache: CacheService<BankTransaction[]>;
  private metrics: MetricsService;
  private patternService: PatternRecognitionService;

  constructor() {
    super();
    this.cache = new CacheService({ ttl: 1000 * 60 * 5 }); // 5 min cache
    this.metrics = new MetricsService();
    this.patternService = new PatternRecognitionService();
  }

  async createTransaction(data: CreateTransactionData): Promise<BankTransaction> {
    return this.executeWithRetry(
      async () => {
        const transaction = await this.db.transaction.create({
          data: {
            ...data,
            hasReceipt: false,
            isReconciled: false,
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

        await this.invalidateUserCache(data.userId);
        await this.metrics.recordMetric('transaction.created', 1);

        return transaction;
      },
      {
        errorCode: 'CREATE_FAILED',
        errorMessage: 'Failed to create transaction',
        context: data
      }
    );
  }

  async getTransactions(
    userId: string,
    options: TransactionQueryOptions = {}
  ): Promise<BankTransaction[]> {
    const cacheKey = this.generateCacheKey('transactions', userId, options);

    return this.cache.getOrSet(cacheKey, async () => {
      return this.executeWithRetry(
        async () => {
          const transactions = await this.db.transaction.findMany({
            where: {
              userId,
              ...(options.startDate && { date: { gte: options.startDate } }),
              ...(options.endDate && { date: { lte: options.endDate } }),
              ...(options.category && { category: options.category }),
              ...(options.type && { type: options.type }),
              ...(options.hasReceipt !== undefined && { hasReceipt: options.hasReceipt }),
              ...(options.isReconciled !== undefined && { isReconciled: options.isReconciled })
            },
            orderBy: { date: 'desc' },
            take: options.limit,
            skip: options.offset,
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

          // Analyze patterns if needed
          if (transactions.length > 0) {
            const patterns = await this.patternService.analyzeTransactionPatterns(
              transactions,
              {
                start: options.startDate || new Date(0),
                end: options.endDate || new Date()
              }
            );
            
            // Enrich transactions with pattern information
            return transactions.map(tx => ({
              ...tx,
              patterns: patterns.get(tx.merchant) || []
            }));
          }

          return transactions;
        },
        {
          errorCode: 'FETCH_FAILED',
          errorMessage: 'Failed to fetch transactions',
          context: { userId, options }
        }
      );
    });
  }

  async updateTransaction(
    id: string,
    data: Partial<BankTransaction>
  ): Promise<BankTransaction> {
    return this.executeWithRetry(
      async () => {
        const transaction = await this.db.transaction.update({
          where: { id },
          data: {
            ...data,
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

        await this.invalidateUserCache(transaction.userId);
        await this.metrics.recordMetric('transaction.updated', 1);

        return transaction;
      },
      {
        errorCode: 'UPDATE_FAILED',
        errorMessage: 'Failed to update transaction',
        context: { id, data }
      }
    );
  }

  async updateTransactionWithMatch(
    transactionId: string,
    matchData: TransactionMatchData
  ): Promise<BankTransaction> {
    return this.executeTransaction(
      async () => {
        const transaction = await this.db.transaction.update({
          where: { id: transactionId },
          data: {
            hasReceipt: true,
            receiptUrl: matchData.receiptUrl,
            matchedExpenseId: matchData.matchedExpenseId,
            matchConfidence: matchData.matchConfidence,
            notes: matchData.notes,
            isReconciled: true,
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

        await this.invalidateUserCache(transaction.userId);
        await this.metrics.recordMetric('transaction.matched', 1);

        return transaction;
      },
      {
        errorCode: 'MATCH_UPDATE_FAILED',
        errorMessage: 'Failed to update transaction match',
        context: { transactionId, matchData }
      }
    );
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    const pattern = new RegExp(`transactions:${userId}`);
    const keys = Array.from(await this.cache.keys()).filter(key => pattern.test(key));
    await Promise.all(keys.map(key => this.cache.delete(key)));
  }

  private generateCacheKey(prefix: string, userId: string, options: any = {}): string {
    return `${prefix}:${userId}:${JSON.stringify(options)}`;
  }

  async batchCreateTransactions(
    transactions: CreateTransactionData[],
    options: {
      validateBeforeCreate?: boolean;
      skipDuplicates?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    created: BankTransaction[];
    failed: Array<{ data: CreateTransactionData; error: Error }>;
    metrics: {
      totalProcessed: number;
      successCount: number;
      failureCount: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const result = {
      created: [] as BankTransaction[],
      failed: [] as Array<{ data: CreateTransactionData; error: Error }>,
      metrics: {
        totalProcessed: transactions.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    const { batchSize = 50 } = options;

    // Process in chunks
    for (let i = 0; i < transactions.length; i += batchSize) {
      const chunk = transactions.slice(i, i + batchSize);
      
      await this.executeTransaction(async () => {
        for (const data of chunk) {
          try {
            if (options.validateBeforeCreate) {
              await this.validateTransaction(data);
            }

            const transaction = await this.db.transaction.create({
              data: {
                ...data,
                hasReceipt: false,
                isReconciled: false,
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

            result.created.push(transaction);
            result.metrics.successCount++;
          } catch (error) {
            result.failed.push({
              data,
              error: error as Error
            });
            result.metrics.failureCount++;
          }
        }
      }, {
        errorCode: 'BATCH_CREATE_FAILED',
        errorMessage: 'Failed to create transactions batch',
        context: { batchSize, options }
      });

      // Log progress
      this.logger.info('Batch progress', {
        processed: Math.min((i + batchSize), transactions.length),
        total: transactions.length,
        successful: result.metrics.successCount,
        failed: result.metrics.failureCount
      });
    }

    result.metrics.processingTime = Date.now() - startTime;

    // Record metrics
    await this.recordBatchMetrics(result.metrics);

    // Invalidate relevant caches
    const userIds = new Set(transactions.map(t => t.userId));
    await Promise.all(Array.from(userIds).map(id => this.invalidateUserCache(id)));

    return result;
  }

  private async validateTransaction(data: CreateTransactionData): Promise<void> {
    const issues: string[] = [];

    if (!data.date) issues.push('Date is required');
    if (typeof data.amount !== 'number') issues.push('Valid amount is required');
    if (!data.description?.trim()) issues.push('Description is required');
    if (!data.merchant?.trim()) issues.push('Merchant is required');
    if (!data.category?.trim()) issues.push('Category is required');
    if (!['personal', 'business'].includes(data.type)) {
      issues.push('Valid type is required');
    }
    if (!data.userId?.trim()) issues.push('User ID is required');

    if (issues.length > 0) {
      throw new BaseServiceError(
        'Transaction validation failed',
        'VALIDATION_FAILED',
        { issues }
      );
    }
  }

  private async recordBatchMetrics(metrics: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    processingTime: number;
  }): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('transaction.batch.total', metrics.totalProcessed),
      this.metrics.recordMetric('transaction.batch.success', metrics.successCount),
      this.metrics.recordMetric('transaction.batch.failed', metrics.failureCount),
      this.metrics.recordMetric('transaction.batch.duration', metrics.processingTime)
    ]);
  }

  // Add sophisticated caching with LRU and Redis support
  private async getCachedTransactions(
    key: string,
    factory: () => Promise<BankTransaction[]>
  ): Promise<BankTransaction[]> {
    // Try memory cache first
    const memoryCache = await this.cache.get(key);
    if (memoryCache) {
      await this.metrics.recordMetric('cache.memory.hit', 1);
      return memoryCache;
    }

    // Try Redis cache
    try {
      const redisCache = await this.redisCache?.get(key);
      if (redisCache) {
        // Warm up memory cache
        await this.cache.set(key, redisCache);
        await this.metrics.recordMetric('cache.redis.hit', 1);
        return redisCache;
      }
    } catch (error) {
      this.logger.warn('Redis cache error', { error });
    }

    // Cache miss - execute factory
    const data = await factory();
    
    // Update both caches
    await Promise.all([
      this.cache.set(key, data),
      this.redisCache?.set(key, data)
    ]);

    await this.metrics.recordMetric('cache.miss', 1);
    return data;
  }

  // Add advanced metrics tracking
  private async trackTransactionMetrics(transaction: BankTransaction): Promise<void> {
    await Promise.all([
      // Transaction metrics
      this.metrics.recordMetric('transaction.amount', Math.abs(transaction.amount)),
      this.metrics.recordMetric(`transaction.category.${transaction.category}`, 1),
      this.metrics.recordMetric(`transaction.type.${transaction.type}`, 1),

      // Time-based metrics
      this.metrics.recordMetric(
        `transaction.hourOfDay.${new Date(transaction.date).getHours()}`,
        1
      ),
      this.metrics.recordMetric(
        `transaction.dayOfWeek.${new Date(transaction.date).getDay()}`,
        1
      ),

      // Receipt metrics
      transaction.hasReceipt && this.metrics.recordMetric('transaction.withReceipt', 1),
      transaction.isReconciled && this.metrics.recordMetric('transaction.reconciled', 1),

      // Performance metrics
      this.metrics.recordMetric(
        'transaction.processingTime',
        Date.now() - new Date(transaction.createdAt).getTime()
      )
    ]);
  }

  async batchUpdateTransactions(
    updates: Array<{ id: string; data: Partial<BankTransaction> }>,
    options: {
      validateBeforeUpdate?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    updated: BankTransaction[];
    failed: Array<{ id: string; error: Error }>;
    metrics: {
      totalProcessed: number;
      successCount: number;
      failureCount: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const result = {
      updated: [] as BankTransaction[],
      failed: [] as Array<{ id: string; error: Error }>,
      metrics: {
        totalProcessed: updates.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    const { batchSize = 50 } = options;

    for (let i = 0; i < updates.length; i += batchSize) {
      const chunk = updates.slice(i, i + batchSize);
      
      await this.executeTransaction(async () => {
        for (const { id, data } of chunk) {
          try {
            const transaction = await this.updateTransaction(id, data);
            result.updated.push(transaction);
            result.metrics.successCount++;
          } catch (error) {
            result.failed.push({ id, error: error as Error });
            result.metrics.failureCount++;
          }
        }
      }, {
        errorCode: 'BATCH_UPDATE_FAILED',
        errorMessage: 'Failed to update transactions batch',
        context: { batchSize, options }
      });
    }

    result.metrics.processingTime = Date.now() - startTime;
    await this.recordBatchMetrics('update', result.metrics);
    return result;
  }

  async batchDeleteTransactions(
    ids: string[],
    options: { batchSize?: number } = {}
  ): Promise<{
    deleted: string[];
    failed: Array<{ id: string; error: Error }>;
    metrics: {
      totalProcessed: number;
      successCount: number;
      failureCount: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const result = {
      deleted: [] as string[],
      failed: [] as Array<{ id: string; error: Error }>,
      metrics: {
        totalProcessed: ids.length,
        successCount: 0,
        failureCount: 0,
        processingTime: 0
      }
    };

    const { batchSize = 50 } = options;

    for (let i = 0; i < ids.length; i += batchSize) {
      const chunk = ids.slice(i, i + batchSize);
      
      await this.executeTransaction(async () => {
        // First delete associated receipts
        await this.db.receipt.deleteMany({
          where: { transactionId: { in: chunk } }
        });

        // Then delete transactions
        await this.db.transaction.deleteMany({
          where: { id: { in: chunk } }
        });

        result.deleted.push(...chunk);
        result.metrics.successCount += chunk.length;
      }, {
        errorCode: 'BATCH_DELETE_FAILED',
        errorMessage: 'Failed to delete transactions batch',
        context: { batchSize, options }
      });
    }

    result.metrics.processingTime = Date.now() - startTime;
    await this.recordBatchMetrics('delete', result.metrics);
    return result;
  }

  private async recordBatchMetrics(
    operation: 'create' | 'update' | 'delete',
    metrics: {
      totalProcessed: number;
      successCount: number;
      failureCount: number;
      processingTime: number;
    }
  ): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric(`transaction.batch.${operation}.total`, metrics.totalProcessed),
      this.metrics.recordMetric(`transaction.batch.${operation}.success`, metrics.successCount),
      this.metrics.recordMetric(`transaction.batch.${operation}.failed`, metrics.failureCount),
      this.metrics.recordMetric(`transaction.batch.${operation}.duration`, metrics.processingTime),
      this.metrics.recordMetric(`transaction.batch.${operation}.rate`, 
        metrics.successCount / (metrics.processingTime / 1000)) // operations per second
    ]);
  }
}

export const transactionService = new TransactionService(); 