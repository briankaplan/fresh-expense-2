'use client';

import { ProcessedReceipt, BankTransaction, ValidationResult } from '@/types';
import { Logger } from '@/utils/logger';
import { MetricsService } from './metrics/metricsService';
import { receiptProcessingService } from './receiptProcessing';
import { expenseMatchingService } from './expenseMatching';
import { expenseReportGenerator } from './reporting/expenseReportGenerator';
import { receiptStyler } from './reporting/receiptStyles';

interface BatchProcessOptions {
  validateReceipts?: boolean;
  matchTransactions?: boolean;
  generateReport?: boolean;
  maxConcurrent?: number;
  progressCallback?: (progress: BatchProgress) => void;
}

interface BatchProgress {
  stage: 'processing' | 'matching' | 'reporting';
  completed: number;
  total: number;
  currentItem?: string;
}

interface BatchResult {
  processed: Array<{
    receipt: ProcessedReceipt;
    matches: Array<{
      transaction: BankTransaction;
      confidence: number;
    }>;
    validation: ValidationResult;
  }>;
  summary: {
    totalProcessed: number;
    matchedCount: number;
    validationScore: number;
    processingTime: number;
    errors: Array<{
      file: string;
      error: string;
    }>;
  };
  report?: {
    pdf?: string;
    csv?: string;
  };
}

export class BatchProcessor {
  private metrics: MetricsService;

  constructor() {
    this.metrics = new MetricsService();
  }

  async processBatch(
    files: File[],
    transactions: BankTransaction[],
    options: BatchProcessOptions = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const result: BatchResult = {
      processed: [],
      summary: {
        totalProcessed: 0,
        matchedCount: 0,
        validationScore: 0,
        processingTime: 0,
        errors: []
      }
    };

    try {
      // Process receipts in chunks to avoid memory issues
      const chunks = this.chunkArray(files, options.maxConcurrent || 5);
      let processedCount = 0;

      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(file => this.processReceiptFile(file, options))
        );

        // Handle results
        chunkResults.forEach((chunkResult, index) => {
          if (chunkResult.status === 'fulfilled') {
            result.processed.push(chunkResult.value);
          } else {
            result.summary.errors.push({
              file: chunk[index].name,
              error: chunkResult.reason.message
            });
          }

          // Update progress
          processedCount++;
          options.progressCallback?.({
            stage: 'processing',
            completed: processedCount,
            total: files.length,
            currentItem: chunk[index].name
          });
        });
      }

      // Match with transactions if requested
      if (options.matchTransactions) {
        await this.matchReceipts(result, transactions, options);
      }

      // Generate report if requested
      if (options.generateReport) {
        result.report = await this.generateReport(result);
      }

      // Calculate summary
      this.calculateSummary(result);

      // Record metrics
      await this.recordBatchMetrics(result);

      return result;
    } catch (error) {
      Logger.error('Batch processing failed', { error });
      throw error;
    }
  }

  private async processReceiptFile(
    file: File,
    options: BatchProcessOptions
  ): Promise<BatchResult['processed'][0]> {
    // Process receipt
    const receipt = await receiptProcessingService.processReceipt(file);

    // Validate if requested
    const validation = options.validateReceipts ?
      await receiptProcessingService.validateReceipt(receipt) :
      { isValid: true, score: 1, issues: [] };

    return {
      receipt,
      matches: [],
      validation
    };
  }

  private async matchReceipts(
    result: BatchResult,
    transactions: BankTransaction[],
    options: BatchProcessOptions
  ): Promise<void> {
    let matchedCount = 0;

    for (const processed of result.processed) {
      try {
        const matches = await expenseMatchingService.findMatches(
          processed.receipt,
          transactions,
          { minConfidence: 0.7 }
        );

        processed.matches = matches.map(match => ({
          transaction: match.transaction,
          confidence: match.confidence
        }));

        if (matches.length > 0) {
          matchedCount++;
        }

        // Update progress
        options.progressCallback?.({
          stage: 'matching',
          completed: matchedCount,
          total: result.processed.length,
          currentItem: processed.receipt.id
        });
      } catch (error) {
        Logger.error('Receipt matching failed', { error, receipt: processed.receipt });
      }
    }
  }

  private async generateReport(result: BatchResult): Promise<{
    pdf: string;
    csv: string;
  }> {
    // Generate PDF report
    const pdfDoc = await expenseReportGenerator.generateReport(
      result.processed.map(p => ({
        ...p.receipt,
        matches: p.matches,
        validation: p.validation
      }))
    );

    // Add styled receipts
    result.processed.forEach(p => {
      receiptStyler.addStyledReceipt(pdfDoc.pdf, {
        merchant: p.receipt.ocrData.merchant,
        date: new Date(p.receipt.ocrData.date),
        items: p.receipt.ocrData.items || [],
        tax: p.receipt.ocrData.tax,
        total: p.receipt.ocrData.total
      }, pdfDoc.pdf.internal.getCurrentPageInfo().pageNumber * 20);
    });

    return {
      pdf: await pdfDoc.pdf.output('datauristring'),
      csv: await this.generateCSV(result)
    };
  }

  private async generateCSV(result: BatchResult): Promise<string> {
    const rows = [
      ['Receipt ID', 'Date', 'Merchant', 'Amount', 'Matched Transaction', 'Confidence', 'Validation Score'],
      ...result.processed.map(p => [
        p.receipt.id,
        p.receipt.ocrData.date,
        p.receipt.ocrData.merchant,
        p.receipt.ocrData.total.toString(),
        p.matches[0]?.transaction.id || '',
        p.matches[0]?.confidence.toFixed(2) || '',
        p.validation.score.toFixed(2)
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private calculateSummary(result: BatchResult): void {
    result.summary = {
      totalProcessed: result.processed.length,
      matchedCount: result.processed.filter(p => p.matches.length > 0).length,
      validationScore: result.processed.reduce((sum, p) => sum + p.validation.score, 0) / result.processed.length,
      processingTime: Date.now() - result.summary.processingTime,
      errors: result.summary.errors
    };
  }

  private async recordBatchMetrics(result: BatchResult): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('batch.total_processed', result.summary.totalProcessed),
      this.metrics.recordMetric('batch.matched_count', result.summary.matchedCount),
      this.metrics.recordMetric('batch.validation_score', result.summary.validationScore),
      this.metrics.recordMetric('batch.processing_time', result.summary.processingTime),
      this.metrics.recordMetric('batch.error_count', result.summary.errors.length)
    ]);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const batchProcessor = new BatchProcessor(); 