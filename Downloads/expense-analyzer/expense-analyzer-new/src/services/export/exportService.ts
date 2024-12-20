'use client';

import { BankTransaction, Expense, ExportFormat, ExportTemplate } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dates';
import { MetricsService } from '../metrics/metricsService';
import { CacheService } from '../cache/cacheService';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface ExportOptions {
  format: ExportFormat;
  template?: ExportTemplate;
  groupBy?: 'category' | 'merchant' | 'date';
  includeReceipts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class ExportService {
  private metrics: MetricsService;
  private cache: CacheService<Buffer>;

  constructor() {
    this.metrics = new MetricsService();
    this.cache = new CacheService({ ttl: 30 * 60 * 1000 }); // 30 minutes
  }

  async exportTransactions(
    transactions: BankTransaction[],
    options: ExportOptions
  ): Promise<Buffer> {
    const startTime = performance.now();

    try {
      // Check cache
      const cacheKey = this.generateCacheKey(transactions, options);
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;

      let result: Buffer;

      switch (options.format) {
        case 'csv':
          result = await this.generateCSV(transactions, options);
          break;
        case 'excel':
          result = await this.generateExcel(transactions, options);
          break;
        case 'pdf':
          result = await this.generatePDF(transactions, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Cache the result
      await this.cache.set(cacheKey, result);

      // Record metrics
      const duration = performance.now() - startTime;
      await this.metrics.recordMetric('export.duration', duration);
      await this.metrics.recordMetric(`export.format.${options.format}`, 1);

      return result;

    } catch (error) {
      Logger.error('Export failed:', error);
      throw new Error('Failed to export transactions');
    }
  }

  private async generateCSV(
    transactions: BankTransaction[],
    options: ExportOptions
  ): Promise<Buffer> {
    const rows = [
      ['Date', 'Description', 'Amount', 'Category', 'Status', 'Receipt']
    ];

    const data = transactions.map(tx => [
      formatDate(tx.date),
      tx.description,
      formatCurrency(tx.amount),
      tx.category,
      tx.status,
      tx.receiptUrl || ''
    ]);

    rows.push(...data);

    const csv = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return Buffer.from(csv, 'utf-8');
  }

  private async generateExcel(
    transactions: BankTransaction[],
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Create main transactions sheet
    const wsData = transactions.map(tx => ({
      Date: formatDate(tx.date),
      Description: tx.description,
      Amount: tx.amount,
      Category: tx.category,
      Status: tx.status
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Transactions');

    // Add summary sheet if grouping is requested
    if (options.groupBy) {
      const summary = this.generateSummary(transactions, options.groupBy);
      const summaryWs = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');
    }

    return Buffer.from(XLSX.write(workbook, { type: 'buffer' }));
  }

  private async generatePDF(
    transactions: BankTransaction[],
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(16);
    doc.text('Transaction Report', 20, 20);

    // Add date range if provided
    if (options.dateRange) {
      doc.setFontSize(12);
      doc.text(
        `Period: ${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}`,
        20,
        30
      );
    }

    // Add transactions table
    const tableData = transactions.map(tx => [
      formatDate(tx.date),
      tx.description.substring(0, 30), // Truncate long descriptions
      formatCurrency(tx.amount),
      tx.category
    ]);

    doc.autoTable({
      head: [['Date', 'Description', 'Amount', 'Category']],
      body: tableData,
      startY: 40,
      margin: { top: 40 }
    });

    // Add summary if grouping is requested
    if (options.groupBy) {
      const summary = this.generateSummary(transactions, options.groupBy);
      doc.addPage();
      doc.text('Summary', 20, 20);
      
      doc.autoTable({
        head: [[options.groupBy.charAt(0).toUpperCase() + options.groupBy.slice(1), 'Total']],
        body: Object.entries(summary).map(([key, value]) => [
          key,
          formatCurrency(value as number)
        ]),
        startY: 30
      });
    }

    return Buffer.from(doc.output('arraybuffer'));
  }

  private generateSummary(
    transactions: BankTransaction[],
    groupBy: string
  ): Record<string, number> {
    return transactions.reduce((acc, tx) => {
      const key = groupBy === 'date'
        ? formatDate(tx.date)
        : tx[groupBy as keyof BankTransaction] || 'unknown';

      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateCacheKey(
    transactions: BankTransaction[],
    options: ExportOptions
  ): string {
    const txHash = transactions
      .map(tx => tx.id)
      .sort()
      .join('');
    
    return `export_${txHash}_${JSON.stringify(options)}`;
  }
}

export const exportService = new ExportService(); 