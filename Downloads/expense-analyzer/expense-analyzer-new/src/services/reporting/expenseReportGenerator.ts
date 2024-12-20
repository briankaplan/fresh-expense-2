'use client';

import { ReconciledItem, BankTransaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Logger } from '@/utils/logger';
import { MetricsService } from '../metrics/metricsService';

interface ReportOptions {
  includeReceipts?: boolean;
  groupByCategory?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  format?: 'pdf' | 'csv' | 'xlsx';
  template?: string;
  metadata?: Record<string, any>;
}

interface ReportSummary {
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
  receiptCoverage: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  metadata: {
    generatedAt: Date;
    itemCount: number;
    categories: string[];
    hasReceipts: number;
  };
}

export class ExpenseReportGenerator {
  private metrics: MetricsService;

  constructor() {
    this.metrics = new MetricsService();
  }

  async generateReport(
    items: ReconciledItem[],
    options: ReportOptions = {}
  ): Promise<{ pdf: jsPDF; summary: ReportSummary }> {
    const startTime = Date.now();

    try {
      // Generate summary data
      const summary = this.generateSummary(items);

      // Create PDF document
      const doc = new jsPDF();
      
      // Add header
      this.addHeader(doc, summary, options);
      
      // Add summary section
      this.addSummarySection(doc, summary);
      
      // Add category breakdown
      if (options.groupByCategory) {
        this.addCategoryBreakdown(doc, items);
      }
      
      // Add detailed transactions
      this.addTransactionDetails(doc, items);
      
      // Add receipts if requested
      if (options.includeReceipts) {
        await this.addReceipts(doc, items);
      }
      
      // Add footer
      this.addFooter(doc, summary);

      // Record metrics
      await this.recordReportMetrics(items, Date.now() - startTime);

      return { pdf: doc, summary };
    } catch (error) {
      Logger.error('Failed to generate expense report', { error });
      throw error;
    }
  }

  private addHeader(doc: jsPDF, summary: ReportSummary, options: ReportOptions): void {
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated: ${formatDateDisplay(new Date())}`, 20, 30);

    if (options.dateRange) {
      doc.text(
        `Period: ${formatDateDisplay(options.dateRange.start)} - ${formatDateDisplay(options.dateRange.end)}`,
        20, 40
      );
    }
  }

  private addSummarySection(doc: jsPDF, summary: ReportSummary): void {
    const startY = 60;
    
    doc.setFontSize(16);
    doc.text('Summary', 20, startY);

    doc.setFontSize(12);
    const summaryData = [
      ['Total Expenses:', formatCurrency(summary.totalAmount)],
      ['Number of Items:', summary.metadata.itemCount.toString()],
      ['Receipt Coverage:', `${(summary.receiptCoverage * 100).toFixed(1)}%`],
      ['Categories:', summary.metadata.categories.length.toString()]
    ];

    doc.autoTable({
      startY: startY + 10,
      head: [],
      body: summaryData,
      theme: 'plain',
      margin: { left: 30 }
    });
  }

  private addCategoryBreakdown(doc: jsPDF, items: ReconciledItem[]): void {
    const categories = this.categorizeExpenses(items);
    const categoryData = Object.entries(categories).map(([category, data]) => [
      category,
      data.count.toString(),
      formatCurrency(data.total),
      `${((data.total / items.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1)}%`
    ]);

    doc.addPage();
    doc.setFontSize(16);
    doc.text('Category Breakdown', 20, 20);

    doc.autoTable({
      startY: 30,
      head: [['Category', 'Count', 'Total', '% of Total']],
      body: categoryData,
      theme: 'striped'
    });
  }

  private async addReceipts(doc: jsPDF, items: ReconciledItem[]): Promise<void> {
    const itemsWithReceipts = items.filter(item => item.receiptUrl);
    
    if (itemsWithReceipts.length === 0) return;

    doc.addPage();
    doc.setFontSize(16);
    doc.text('Receipts', 20, 20);

    let y = 40;
    for (const item of itemsWithReceipts) {
      try {
        const response = await fetch(item.receiptUrl!);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        // Add receipt image
        doc.addImage(imageUrl, 'JPEG', 20, y, 170, 100);
        
        // Add caption
        doc.setFontSize(10);
        doc.text(
          `${formatDateDisplay(item.date)} - ${item.description} - ${formatCurrency(item.amount)}`,
          20,
          y + 110
        );

        y += 120;
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        URL.revokeObjectURL(imageUrl);
      } catch (error) {
        Logger.error('Failed to add receipt to report', { error, item });
      }
    }
  }

  private addFooter(doc: jsPDF, summary: ReportSummary): void {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount} - Generated ${formatDateDisplay(summary.metadata.generatedAt)}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  }

  private async recordReportMetrics(
    items: ReconciledItem[],
    duration: number
  ): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('report.generation_time', duration),
      this.metrics.recordMetric('report.item_count', items.length),
      this.metrics.recordMetric('report.total_amount', 
        items.reduce((sum, item) => sum + item.amount, 0)
      ),
      this.metrics.recordMetric('report.receipt_coverage',
        items.filter(item => item.receiptUrl).length / items.length
      )
    ]);
  }

  private categorizeExpenses(items: ReconciledItem[]) {
    return items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          items: []
        };
      }
      acc[category].total += item.amount;
      acc[category].count++;
      acc[category].items.push(item);
      return acc;
    }, {} as Record<string, { total: number; count: number; items: ReconciledItem[] }>);
  }

  private generateSummary(items: ReconciledItem[]): ReportSummary {
    const categories = this.categorizeExpenses(items);
    
    return {
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
      categoryBreakdown: Object.entries(categories).reduce(
        (acc, [category, data]) => ({
          ...acc,
          [category]: data.total
        }),
        {}
      ),
      receiptCoverage: items.filter(item => item.receiptUrl).length / items.length,
      dateRange: {
        start: new Date(Math.min(...items.map(item => new Date(item.date).getTime()))),
        end: new Date(Math.max(...items.map(item => new Date(item.date).getTime())))
      },
      metadata: {
        generatedAt: new Date(),
        itemCount: items.length,
        categories: Object.keys(categories),
        hasReceipts: items.filter(item => item.receiptUrl).length
      }
    };
  }
}

export const expenseReportGenerator = new ExpenseReportGenerator(); 