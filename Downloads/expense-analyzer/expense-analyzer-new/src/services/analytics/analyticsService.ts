'use client';

import { BankTransaction, Expense, AnalyticsResult, DateRange } from '@/types';
import { MetricsService } from '../metrics/metricsService';
import { CacheService } from '../cache/cacheService';
import { formatCurrency } from '@/utils/currency';
import { startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface AnalyticsOptions {
  groupBy?: 'category' | 'merchant' | 'month';
  filter?: {
    dateRange?: DateRange;
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
  includeReceipts?: boolean;
  calculateTrends?: boolean;
}

export class AnalyticsService {
  private cache: CacheService<AnalyticsResult>;
  private metrics: MetricsService;

  constructor() {
    this.cache = new CacheService({ ttl: 15 * 60 * 1000 }); // 15 minutes
    this.metrics = new MetricsService();
  }

  async analyzeTransactions(
    transactions: BankTransaction[],
    options: AnalyticsOptions = {}
  ): Promise<AnalyticsResult> {
    const startTime = performance.now();

    try {
      // Apply filters
      let filtered = this.filterTransactions(transactions, options.filter);

      // Group data
      const grouped = this.groupTransactions(filtered, options.groupBy || 'category');

      // Calculate statistics
      const stats = this.calculateStatistics(filtered);

      // Calculate trends if requested
      const trends = options.calculateTrends
        ? await this.calculateTrends(filtered)
        : undefined;

      // Prepare result
      const result: AnalyticsResult = {
        summary: {
          totalTransactions: filtered.length,
          totalAmount: stats.total,
          averageAmount: stats.average,
          largestTransaction: stats.largest,
          mostFrequentMerchant: stats.mostFrequentMerchant
        },
        groupedData: grouped,
        trends,
        metadata: {
          dateRange: options.filter?.dateRange,
          generatedAt: new Date().toISOString(),
          processingTime: performance.now() - startTime
        }
      };

      // Cache the result
      const cacheKey = this.generateCacheKey(options);
      await this.cache.set(cacheKey, result);

      return result;

    } catch (error) {
      Logger.error('Analytics processing failed:', error);
      throw new Error('Failed to process analytics');
    }
  }

  async generateMonthlyReport(
    transactions: BankTransaction[],
    month: Date
  ): Promise<string> {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const result = await this.analyzeTransactions(transactions, {
      filter: {
        dateRange: { start, end }
      },
      groupBy: 'category',
      calculateTrends: true
    });

    return this.formatReport(result);
  }

  private filterTransactions(
    transactions: BankTransaction[],
    filter?: AnalyticsOptions['filter']
  ): BankTransaction[] {
    if (!filter) return transactions;

    return transactions.filter(tx => {
      if (filter.dateRange) {
        const date = new Date(tx.date);
        if (date < filter.dateRange.start || date > filter.dateRange.end) {
          return false;
        }
      }

      if (filter.minAmount && tx.amount < filter.minAmount) return false;
      if (filter.maxAmount && tx.amount > filter.maxAmount) return false;
      if (filter.categories && !filter.categories.includes(tx.category)) return false;
      if (filter.merchants && !filter.merchants.includes(tx.description)) return false;

      return true;
    });
  }

  private groupTransactions(
    transactions: BankTransaction[],
    groupBy: string
  ): Record<string, number> {
    return transactions.reduce((acc, tx) => {
      const key = groupBy === 'month'
        ? new Date(tx.date).toISOString().slice(0, 7)
        : tx[groupBy as keyof BankTransaction] || 'unknown';

      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateStatistics(transactions: BankTransaction[]) {
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const average = total / transactions.length;

    const merchantCounts = transactions.reduce((acc, tx) => {
      acc[tx.description] = (acc[tx.description] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentMerchant = Object.entries(merchantCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const largest = transactions.reduce((max, tx) => 
      tx.amount > max.amount ? tx : max
    );

    return {
      total,
      average,
      mostFrequentMerchant,
      largest
    };
  }

  private async calculateTrends(transactions: BankTransaction[]) {
    // TODO: Implement trend analysis
    return {
      monthOverMonth: 0,
      yearOverYear: 0
    };
  }

  private formatReport(result: AnalyticsResult): string {
    // TODO: Implement report formatting
    return JSON.stringify(result, null, 2);
  }

  private generateCacheKey(options: AnalyticsOptions): string {
    return `analytics_${JSON.stringify(options)}`;
  }
}

export const analyticsService = new AnalyticsService(); 