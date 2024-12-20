'use client';

import { BankTransaction, ProcessedReceipt, ValidationResult, BatchProcessingStatus } from '@/types';
import { Logger } from '@/utils/logger';
import { MetricsService } from '../metrics/metricsService';
import { transactionCategorizer } from '../categorization/transactionCategorizer';
import { receiptProcessingService } from '../receiptProcessing';
import { merchantMappingService } from '../merchantMapping';

interface BatchProcessingOptions {
  validateData?: boolean;
  categorizeTransactions?: boolean;
  processReceipts?: boolean;
  matchMerchants?: boolean;
  chunkSize?: number;
  concurrency?: number;
}

export class BatchProcessingService {
  private metrics: MetricsService;
  private status: Map<string, BatchProcessingStatus>;

  constructor() {
    this.metrics = new MetricsService();
    this.status = new Map();
  }

  async processBatch(
    batchId: string,
    transactions: BankTransaction[],
    receipts: File[],
    options: BatchProcessingOptions = {}
  ): Promise<ValidationResult> {
    const startTime = performance.now();
    this.updateStatus(batchId, 'starting');

    try {
      // Split into manageable chunks
      const chunks = this.chunkArray(transactions, options.chunkSize || 50);
      const results: ValidationResult[] = [];

      for (const [index, chunk] of chunks.entries()) {
        this.updateStatus(batchId, 'processing', {
          progress: (index / chunks.length) * 100,
          currentChunk: index + 1,
          totalChunks: chunks.length
        });

        const chunkResult = await this.processChunk(chunk, receipts, options);
        results.push(chunkResult);

        // Record metrics for the chunk
        await this.recordChunkMetrics(chunkResult);
      }

      const finalResult = this.mergeResults(results);
      const processingTime = performance.now() - startTime;

      this.updateStatus(batchId, 'completed', {
        processingTime,
        totalProcessed: transactions.length,
        successCount: finalResult.success.length,
        errorCount: finalResult.errors.length
      });

      return finalResult;

    } catch (error) {
      Logger.error('Batch processing failed:', error);
      this.updateStatus(batchId, 'failed', { error: error.message });
      throw error;
    }
  }

  async getStatus(batchId: string): Promise<BatchProcessingStatus | null> {
    return this.status.get(batchId) || null;
  }

  private async processChunk(
    chunk: BankTransaction[],
    receipts: File[],
    options: BatchProcessingOptions
  ): Promise<ValidationResult> {
    const results: ValidationResult = {
      success: [],
      errors: [],
      warnings: []
    };

    await Promise.all(
      chunk.map(async transaction => {
        try {
          // Validate and enrich transaction data
          if (options.validateData) {
            const validationIssues = this.validateTransaction(transaction);
            if (validationIssues.length > 0) {
              results.warnings.push({
                transactionId: transaction.id,
                issues: validationIssues
              });
            }
          }

          // Categorize transaction
          if (options.categorizeTransactions) {
            const category = await transactionCategorizer.categorizeTransaction(transaction);
            transaction.category = category.category;
          }

          // Match merchant
          if (options.matchMerchants) {
            const merchantInfo = await merchantMappingService.findMerchant(
              transaction.description
            );
            if (merchantInfo) {
              transaction.merchantInfo = merchantInfo;
            }
          }

          // Process associated receipt
          if (options.processReceipts) {
            const receipt = this.findReceiptForTransaction(transaction, receipts);
            if (receipt) {
              const processedReceipt = await receiptProcessingService.processReceipt(receipt);
              transaction.receiptData = processedReceipt;
            }
          }

          results.success.push(transaction);

        } catch (error) {
          Logger.error(`Failed to process transaction ${transaction.id}:`, error);
          results.errors.push({
            transactionId: transaction.id,
            error: error.message
          });
        }
      })
    );

    return results;
  }

  private validateTransaction(transaction: BankTransaction): string[] {
    const issues: string[] = [];

    if (!transaction.date) issues.push('Missing date');
    if (!transaction.amount) issues.push('Missing amount');
    if (!transaction.description) issues.push('Missing description');

    // Add more validation rules as needed

    return issues;
  }

  private findReceiptForTransaction(
    transaction: BankTransaction,
    receipts: File[]
  ): File | null {
    // TODO: Implement receipt matching logic
    return null;
  }

  private updateStatus(
    batchId: string,
    status: string,
    details: Record<string, any> = {}
  ): void {
    this.status.set(batchId, {
      status,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  private async recordChunkMetrics(result: ValidationResult): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('batch.success', result.success.length),
      this.metrics.recordMetric('batch.errors', result.errors.length),
      this.metrics.recordMetric('batch.warnings', result.warnings.length)
    ]);
  }

  private mergeResults(results: ValidationResult[]): ValidationResult {
    return results.reduce(
      (acc, curr) => ({
        success: [...acc.success, ...curr.success],
        errors: [...acc.errors, ...curr.errors],
        warnings: [...acc.warnings, ...curr.warnings]
      }),
      { success: [], errors: [], warnings: [] }
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const batchProcessor = new BatchProcessingService(); 