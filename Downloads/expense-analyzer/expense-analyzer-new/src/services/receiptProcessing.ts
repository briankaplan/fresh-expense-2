'use client';

import { ProcessedReceipt, OCRResult } from '@/types';
import { Logger } from '@/utils/logger';
import { CacheService } from './cache/cacheService';
import { MetricsService } from './metrics/metricsService';
import { merchantMappingService } from '@/utils/merchantMapping';
import { detectAmountPatterns } from './expenseMatching';

interface ProcessingOptions {
  validateData?: boolean;
  enhanceText?: boolean;
  detectMerchant?: boolean;
  extractItems?: boolean;
}

interface ProcessingResult {
  receipt: ProcessedReceipt;
  confidence: number;
  warnings: string[];
}

export class ReceiptProcessingService {
  private cache: CacheService<ProcessedReceipt>;
  private metrics: MetricsService;

  constructor() {
    this.cache = new CacheService({
      ttl: 30 * 60 * 1000, // 30 minutes
      max: 100
    });
    this.metrics = new MetricsService();
  }

  async processReceipt(
    file: File,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Check cache
      const cacheKey = await this.generateCacheKey(file);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          receipt: cached,
          confidence: 1,
          warnings: []
        };
      }

      // Process the receipt
      const ocrResult = await this.performOCR(file);
      
      // Enhance and validate data
      const enhancedData = options.enhanceText 
        ? await this.enhanceText(ocrResult)
        : ocrResult;

      if (options.validateData) {
        const validationIssues = this.validateData(enhancedData);
        warnings.push(...validationIssues);
      }

      // Detect merchant
      let merchantInfo = null;
      if (options.detectMerchant && enhancedData.merchant) {
        merchantInfo = await merchantMappingService.findMerchant(
          enhancedData.merchant
        );
      }

      // Process line items if requested
      const lineItems = options.extractItems 
        ? await this.extractLineItems(enhancedData)
        : [];

      const processedReceipt: ProcessedReceipt = {
        ...enhancedData,
        merchantInfo,
        lineItems,
        processingTime: Date.now() - startTime,
        warnings
      };

      // Cache the result
      await this.cache.set(cacheKey, processedReceipt);

      // Record metrics
      await this.recordMetrics(processedReceipt);

      return {
        receipt: processedReceipt,
        confidence: this.calculateConfidence(processedReceipt),
        warnings
      };

    } catch (error) {
      Logger.error('Receipt processing failed:', error);
      throw new Error('Failed to process receipt');
    }
  }

  private async performOCR(file: File): Promise<OCRResult> {
    // TODO: Implement actual OCR
    return {
      merchant: "Sample Store",
      date: new Date().toISOString(),
      total: 99.99,
      tax: 8.99,
      confidence: 0.95,
      items: []
    };
  }

  private async enhanceText(data: OCRResult): Promise<OCRResult> {
    // TODO: Implement text enhancement
    return data;
  }

  private validateData(data: OCRResult): string[] {
    const issues: string[] = [];

    if (!data.merchant) {
      issues.push('No merchant name detected');
    }

    if (!data.total || data.total <= 0) {
      issues.push('Invalid total amount');
    }

    if (!data.date) {
      issues.push('No date detected');
    }

    return issues;
  }

  private calculateConfidence(receipt: ProcessedReceipt): number {
    let confidence = 1.0;

    if (receipt.warnings.length > 0) {
      confidence *= 0.8;
    }

    if (!receipt.merchantInfo) {
      confidence *= 0.9;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  private async generateCacheKey(file: File): Promise<string> {
    // Generate a unique key based on file content
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async recordMetrics(receipt: ProcessedReceipt): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('receipt.processing.time', receipt.processingTime),
      this.metrics.recordMetric('receipt.warnings', receipt.warnings.length),
      this.metrics.recordMetric('receipt.merchant.detected', receipt.merchantInfo ? 1 : 0)
    ]);
  }
}

export const receiptProcessingService = new ReceiptProcessingService(); 