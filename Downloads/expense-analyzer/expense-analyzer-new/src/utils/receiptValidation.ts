'use client';

import { OCRResult, ProcessedReceipt } from '@/types';
import { Logger } from '@/utils/logger';
import { MetricsService } from '@/services/metrics/metricsService';

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  code: string;
  field?: string;
  details?: Record<string, any>;
}

interface ValidationOptions {
  requireItemization?: boolean;
  requireTax?: boolean;
  maxAge?: number; // days
  minConfidence?: number;
  allowFutureDate?: boolean;
  validateMerchant?: boolean;
  validateItems?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  metadata: {
    processingTime: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

class ReceiptValidator {
  private metrics: MetricsService;
  private readonly DEFAULT_OPTIONS: ValidationOptions = {
    requireItemization: true,
    requireTax: true,
    maxAge: 90, // 3 months
    minConfidence: 0.7,
    allowFutureDate: false,
    validateMerchant: true,
    validateItems: true
  };

  constructor() {
    this.metrics = new MetricsService();
  }

  async validateReceipt(
    receipt: ProcessedReceipt | OCRResult,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Extract OCR data
      const ocrData = 'ocrData' in receipt ? receipt.ocrData : receipt;

      // Required fields validation
      this.validateRequiredFields(ocrData, issues);

      // Date validation
      this.validateDate(ocrData.date, opts, issues);

      // Amount validation
      this.validateAmounts(ocrData, opts, issues);

      // Merchant validation
      if (opts.validateMerchant) {
        await this.validateMerchant(ocrData.merchant, issues);
      }

      // Items validation
      if (opts.validateItems && ocrData.items?.length) {
        this.validateItems(ocrData, issues);
      }

      // OCR confidence validation
      if (ocrData.confidence < opts.minConfidence!) {
        issues.push({
          severity: 'warning',
          message: `Low OCR confidence (${(ocrData.confidence * 100).toFixed(1)}%)`,
          code: 'LOW_CONFIDENCE',
          details: { confidence: ocrData.confidence }
        });
      }

      // Business rules validation
      this.validateBusinessRules(ocrData, opts, issues);

      // Record metrics
      await this.recordValidationMetrics(issues, startTime);

      return {
        isValid: !issues.some(i => i.severity === 'critical'),
        issues,
        metadata: {
          processingTime: Date.now() - startTime,
          criticalCount: issues.filter(i => i.severity === 'critical').length,
          warningCount: issues.filter(i => i.severity === 'warning').length,
          infoCount: issues.filter(i => i.severity === 'info').length
        }
      };
    } catch (error) {
      Logger.error('Receipt validation failed', { error });
      throw error;
    }
  }

  private validateRequiredFields(ocrData: OCRResult, issues: ValidationIssue[]): void {
    const requiredFields: Array<{ field: keyof OCRResult; label: string }> = [
      { field: 'merchant', label: 'Merchant name' },
      { field: 'date', label: 'Transaction date' },
      { field: 'total', label: 'Total amount' }
    ];

    for (const { field, label } of requiredFields) {
      if (!ocrData[field]) {
        issues.push({
          severity: 'critical',
          message: `Missing ${label}`,
          code: `MISSING_${field.toUpperCase()}`,
          field
        });
      }
    }
  }

  private validateDate(
    date: string | undefined,
    options: ValidationOptions,
    issues: ValidationIssue[]
  ): void {
    if (!date) return;

    const receiptDate = new Date(date);
    const now = new Date();

    // Future date check
    if (!options.allowFutureDate && receiptDate > now) {
      issues.push({
        severity: 'critical',
        message: 'Receipt date cannot be in the future',
        code: 'FUTURE_DATE',
        field: 'date',
        details: { date: receiptDate }
      });
    }

    // Age check
    const maxAge = options.maxAge || this.DEFAULT_OPTIONS.maxAge!;
    const ageInDays = Math.floor(
      (now.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ageInDays > maxAge) {
      issues.push({
        severity: 'warning',
        message: `Receipt is ${ageInDays} days old`,
        code: 'OLD_RECEIPT',
        field: 'date',
        details: { age: ageInDays, maxAge }
      });
    }
  }

  private validateAmounts(
    ocrData: OCRResult,
    options: ValidationOptions,
    issues: ValidationIssue[]
  ): void {
    if (!ocrData.total) return;

    // Validate total amount
    if (ocrData.total <= 0) {
      issues.push({
        severity: 'critical',
        message: 'Total amount must be positive',
        code: 'INVALID_TOTAL',
        field: 'total'
      });
    }

    // Validate items total
    if (ocrData.items?.length) {
      const itemsTotal = ocrData.items.reduce((sum, item) => sum + item.amount, 0);
      const totalWithTax = itemsTotal + (ocrData.tax || 0);
      const difference = Math.abs(totalWithTax - ocrData.total);

      if (difference > 0.01) {
        issues.push({
          severity: 'warning',
          message: 'Items total + tax does not match receipt total',
          code: 'TOTAL_MISMATCH',
          details: {
            itemsTotal,
            tax: ocrData.tax,
            total: ocrData.total,
            difference
          }
        });
      }
    }
  }

  private async validateMerchant(
    merchant: string | undefined,
    issues: ValidationIssue[]
  ): Promise<void> {
    if (!merchant) return;

    // Add merchant-specific validations here
    // For example, check against known merchants, validate format, etc.
  }

  private validateItems(ocrData: OCRResult, issues: ValidationIssue[]): void {
    if (!ocrData.items) return;

    for (const [index, item] of ocrData.items.entries()) {
      if (!item.description) {
        issues.push({
          severity: 'warning',
          message: `Missing description for item ${index + 1}`,
          code: 'MISSING_ITEM_DESCRIPTION',
          field: 'items',
          details: { itemIndex: index }
        });
      }

      if (typeof item.amount !== 'number' || item.amount <= 0) {
        issues.push({
          severity: 'warning',
          message: `Invalid amount for item ${index + 1}`,
          code: 'INVALID_ITEM_AMOUNT',
          field: 'items',
          details: { itemIndex: index, amount: item.amount }
        });
      }
    }
  }

  private validateBusinessRules(
    ocrData: OCRResult,
    options: ValidationOptions,
    issues: ValidationIssue[]
  ): void {
    // High value receipt rules
    if (ocrData.total >= 75) {
      if (options.requireItemization && !ocrData.items?.length) {
        issues.push({
          severity: 'warning',
          message: 'Itemized list required for expenses over $75',
          code: 'ITEMIZATION_REQUIRED',
          details: { total: ocrData.total }
        });
      }

      if (options.requireTax && !ocrData.tax) {
        issues.push({
          severity: 'warning',
          message: 'Tax amount required for expenses over $75',
          code: 'TAX_REQUIRED',
          details: { total: ocrData.total }
        });
      }
    }
  }

  private async recordValidationMetrics(
    issues: ValidationIssue[],
    startTime: number
  ): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('validation.processing_time', Date.now() - startTime),
      this.metrics.recordMetric('validation.critical_issues', 
        issues.filter(i => i.severity === 'critical').length
      ),
      this.metrics.recordMetric('validation.warning_issues',
        issues.filter(i => i.severity === 'warning').length
      ),
      ...issues.map(issue => 
        this.metrics.recordMetric(`validation.issue.${issue.code.toLowerCase()}`, 1)
      )
    ]);
  }

  getValidationSummary(result: ValidationResult): string {
    if (result.issues.length === 0) {
      return 'Receipt validation passed';
    }

    const summary = [];
    if (result.metadata.criticalCount > 0) {
      summary.push(`${result.metadata.criticalCount} critical issues`);
    }
    if (result.metadata.warningCount > 0) {
      summary.push(`${result.metadata.warningCount} warnings`);
    }
    if (result.metadata.infoCount > 0) {
      summary.push(`${result.metadata.infoCount} info messages`);
    }

    return `Receipt validation: ${summary.join(', ')}`;
  }
}

export const receiptValidator = new ReceiptValidator(); 