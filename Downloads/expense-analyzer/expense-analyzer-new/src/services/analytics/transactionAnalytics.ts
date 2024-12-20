'use client';

import { BaseService } from '../db/baseService';
import { BankTransaction } from '@/types';
import { MetricsService } from '../metrics/metricsService';

export class TransactionAnalytics extends BaseService {
  private metrics: MetricsService;

  constructor() {
    super();
    this.metrics = new MetricsService();
  }

  async analyzeTransactions(
    transactions: BankTransaction[]
  ): Promise<{
    totalAmount: number;
    averageAmount: number;
    categoryBreakdown: Record<string, number>;
    timeOfDayAnalysis: Record<string, number>;
    dayOfWeekAnalysis: Record<string, number>;
    merchantFrequency: Record<string, number>;
    receiptCoverage: number;
    reconciliationRate: number;
  }> {
    const analysis = {
      totalAmount: 0,
      averageAmount: 0,
      categoryBreakdown: {} as Record<string, number>,
      timeOfDayAnalysis: {} as Record<string, number>,
      dayOfWeekAnalysis: {} as Record<string, number>,
      merchantFrequency: {} as Record<string, number>,
      receiptCoverage: 0,
      reconciliationRate: 0
    };

    transactions.forEach(tx => {
      // Amount analysis
      analysis.totalAmount += Math.abs(tx.amount);
      
      // Category breakdown
      analysis.categoryBreakdown[tx.category] = 
        (analysis.categoryBreakdown[tx.category] || 0) + Math.abs(tx.amount);
      
      // Time analysis
      const date = new Date(tx.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      analysis.timeOfDayAnalysis[hour] = 
        (analysis.timeOfDayAnalysis[hour] || 0) + 1;
      analysis.dayOfWeekAnalysis[dayOfWeek] = 
        (analysis.dayOfWeekAnalysis[dayOfWeek] || 0) + 1;
      
      // Merchant analysis
      analysis.merchantFrequency[tx.merchant] = 
        (analysis.merchantFrequency[tx.merchant] || 0) + 1;
    });

    // Calculate averages and rates
    analysis.averageAmount = analysis.totalAmount / transactions.length;
    analysis.receiptCoverage = 
      transactions.filter(tx => tx.hasReceipt).length / transactions.length;
    analysis.reconciliationRate = 
      transactions.filter(tx => tx.isReconciled).length / transactions.length;

    // Record analytics as metrics
    await this.recordAnalyticsMetrics(analysis);

    return analysis;
  }

  private async recordAnalyticsMetrics(analysis: any): Promise<void> {
    const metrics = [
      ['transaction.analysis.total_amount', analysis.totalAmount],
      ['transaction.analysis.average_amount', analysis.averageAmount],
      ['transaction.analysis.receipt_coverage', analysis.receiptCoverage],
      ['transaction.analysis.reconciliation_rate', analysis.reconciliationRate],
      ...Object.entries(analysis.categoryBreakdown)
        .map(([category, amount]) => 
          [`transaction.analysis.category.${category}`, amount]
        ),
      ...Object.entries(analysis.merchantFrequency)
        .map(([merchant, count]) => 
          [`transaction.analysis.merchant.${merchant}`, count]
        )
    ];

    await Promise.all(
      metrics.map(([name, value]) => 
        this.metrics.recordMetric(name as string, value as number)
      )
    );
  }
} 