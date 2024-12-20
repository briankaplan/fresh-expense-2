'use client';

import { BaseService } from '../db/baseService';
import { BankTransaction, ProcessedReceipt } from '@/types';
import { CacheService } from '../cache/cacheService';
import { MetricsService } from '../metrics/metricsService';

interface TransactionPattern {
  merchant: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  typicalAmount?: number;
  typicalDayOfWeek?: number;
  typicalDayOfMonth?: number;
  typicalTimeOfDay?: number;
  amountVariance: number;
  category?: string;
  confidence: number;
}

interface MerchantProfile {
  name: string;
  aliases: string[];
  patterns: TransactionPattern[];
  locations?: string[];
  categories: Set<string>;
  lastUpdated: Date;
}

export class PatternRecognitionService extends BaseService {
  private cache: CacheService<MerchantProfile>;
  private metrics: MetricsService;
  private readonly MIN_TRANSACTIONS = 3;
  private readonly PATTERN_TTL = 1000 * 60 * 60 * 24; // 24 hours

  constructor() {
    super();
    this.cache = new CacheService({ ttl: this.PATTERN_TTL });
    this.metrics = new MetricsService();
  }

  async analyzeTransactionPatterns(
    transactions: BankTransaction[],
    timeframe: { start: Date; end: Date }
  ): Promise<Map<string, TransactionPattern[]>> {
    const patterns = new Map<string, TransactionPattern[]>();
    const merchantGroups = this.groupTransactionsByMerchant(transactions);

    for (const [merchant, merchantTransactions] of merchantGroups) {
      if (merchantTransactions.length >= this.MIN_TRANSACTIONS) {
        const merchantPatterns = await this.detectMerchantPatterns(
          merchant,
          merchantTransactions,
          timeframe
        );
        patterns.set(merchant, merchantPatterns);
      }
    }

    return patterns;
  }

  private groupTransactionsByMerchant(
    transactions: BankTransaction[]
  ): Map<string, BankTransaction[]> {
    const groups = new Map<string, BankTransaction[]>();
    
    for (const tx of transactions) {
      const merchant = this.normalizeMerchantName(tx.description);
      if (!groups.has(merchant)) {
        groups.set(merchant, []);
      }
      groups.get(merchant)!.push(tx);
    }

    return groups;
  }

  private async detectMerchantPatterns(
    merchant: string,
    transactions: BankTransaction[],
    timeframe: { start: Date; end: Date }
  ): Promise<TransactionPattern[]> {
    const patterns: TransactionPattern[] = [];
    const sortedTxs = transactions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Check for recurring patterns
    const frequencies = this.analyzeFrequencies(sortedTxs, timeframe);
    const amounts = this.analyzeAmounts(sortedTxs);
    const timing = this.analyzeTimingPatterns(sortedTxs);

    // Combine analyses into patterns
    for (const frequency of frequencies) {
      patterns.push({
        merchant,
        ...frequency,
        ...amounts,
        ...timing,
        confidence: this.calculatePatternConfidence(frequency, amounts, timing)
      });
    }

    return patterns;
  }

  private analyzeFrequencies(
    transactions: BankTransaction[],
    timeframe: { start: Date; end: Date }
  ): Array<Pick<TransactionPattern, 'frequency' | 'confidence'>> {
    const intervals = this.calculateIntervals(transactions);
    const patterns: Array<Pick<TransactionPattern, 'frequency' | 'confidence'>> = [];

    // Daily pattern
    if (this.hasRegularInterval(intervals, 1)) {
      patterns.push({ frequency: 'daily', confidence: 0.9 });
    }

    // Weekly pattern
    if (this.hasRegularInterval(intervals, 7)) {
      patterns.push({ frequency: 'weekly', confidence: 0.8 });
    }

    // Monthly pattern
    const monthlyConfidence = this.detectMonthlyPattern(transactions);
    if (monthlyConfidence > 0.6) {
      patterns.push({ frequency: 'monthly', confidence: monthlyConfidence });
    }

    // Irregular (fallback)
    if (patterns.length === 0) {
      patterns.push({ 
        frequency: 'irregular', 
        confidence: this.calculateIrregularConfidence(intervals) 
      });
    }

    return patterns;
  }

  private analyzeAmounts(
    transactions: BankTransaction[]
  ): Pick<TransactionPattern, 'typicalAmount' | 'amountVariance'> {
    const amounts = transactions.map(tx => Math.abs(tx.amount));
    
    // Calculate statistics
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
    
    return {
      typicalAmount: mean,
      amountVariance: Math.sqrt(variance) // Standard deviation
    };
  }

  private analyzeTimingPatterns(
    transactions: BankTransaction[]
  ): Pick<TransactionPattern, 'typicalDayOfWeek' | 'typicalDayOfMonth' | 'typicalTimeOfDay'> {
    const dates = transactions.map(tx => new Date(tx.date));
    
    // Analyze days of week
    const dowCounts = new Array(7).fill(0);
    dates.forEach(date => dowCounts[date.getDay()]++);
    const typicalDayOfWeek = dowCounts.indexOf(Math.max(...dowCounts));

    // Analyze days of month
    const domCounts = new Array(31).fill(0);
    dates.forEach(date => domCounts[date.getDate() - 1]++);
    const typicalDayOfMonth = domCounts.indexOf(Math.max(...domCounts)) + 1;

    // Analyze time of day
    const hours = dates.map(date => date.getHours());
    const typicalTimeOfDay = hours.reduce((sum, h) => sum + h, 0) / hours.length;

    return {
      typicalDayOfWeek,
      typicalDayOfMonth,
      typicalTimeOfDay
    };
  }

  private calculateIntervals(transactions: BankTransaction[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const days = Math.round(
        (new Date(transactions[i].date).getTime() - 
         new Date(transactions[i-1].date).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }
    return intervals;
  }

  private hasRegularInterval(intervals: number[], targetDays: number): boolean {
    const tolerance = Math.max(1, targetDays * 0.2); // 20% tolerance
    return intervals.every(interval => 
      Math.abs(interval - targetDays) <= tolerance
    );
  }

  private detectMonthlyPattern(transactions: BankTransaction[]): number {
    const dates = transactions.map(tx => new Date(tx.date));
    const dayOfMonthCounts = new Array(31).fill(0);
    
    dates.forEach(date => {
      dayOfMonthCounts[date.getDate() - 1]++;
    });

    const maxCount = Math.max(...dayOfMonthCounts);
    return maxCount / transactions.length;
  }

  private calculateIrregularConfidence(intervals: number[]): number {
    const mean = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length;
    
    // Higher variance = lower confidence in pattern
    return Math.max(0.1, 1 - Math.min(1, Math.sqrt(variance) / mean));
  }

  private calculatePatternConfidence(
    frequency: Pick<TransactionPattern, 'frequency' | 'confidence'>,
    amounts: Pick<TransactionPattern, 'typicalAmount' | 'amountVariance'>,
    timing: Pick<TransactionPattern, 'typicalDayOfWeek' | 'typicalDayOfMonth' | 'typicalTimeOfDay'>
  ): number {
    let confidence = frequency.confidence;

    // Adjust based on amount consistency
    const amountVarianceRatio = amounts.amountVariance / amounts.typicalAmount;
    confidence *= (1 - Math.min(1, amountVarianceRatio));

    // Adjust based on timing consistency
    if (frequency.frequency === 'weekly' && timing.typicalDayOfWeek !== undefined) {
      confidence *= 1.2; // Boost confidence for consistent weekly patterns
    }
    if (frequency.frequency === 'monthly' && timing.typicalDayOfMonth !== undefined) {
      confidence *= 1.2; // Boost confidence for consistent monthly patterns
    }

    return Math.min(1, Math.max(0, confidence));
  }

  private normalizeMerchantName(name: string): string {
    // Implement merchant name normalization
    return name.toLowerCase().trim();
  }
} 