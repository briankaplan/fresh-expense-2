'use client';

import { BankTransaction, Expense, Category } from '@/types';
import { Logger } from '@/utils/logger';
import { MetricsService } from '../metrics/metricsService';
import { merchantMappingService } from '../merchantMapping';
import { CacheService } from '../cache/cacheService';

interface CategoryRule {
  pattern: RegExp | string;
  category: Category;
  confidence: number;
  metadata?: {
    isRecurring?: boolean;
    requiresReceipt?: boolean;
  };
}

export class TransactionCategorizerService {
  private cache: CacheService<string>;
  private metrics: MetricsService;
  private rules: CategoryRule[] = [];
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    this.cache = new CacheService({ ttl: 24 * 60 * 60 * 1000 }); // 24 hours
    this.metrics = new MetricsService();
    this.initializeRules();
  }

  async categorizeTransaction(transaction: BankTransaction): Promise<{
    category: Category;
    confidence: number;
    metadata?: Record<string, any>;
  }> {
    const startTime = performance.now();

    try {
      // Check cache first
      const cacheKey = `cat_${transaction.id}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Try merchant mapping first
      const merchantInfo = await merchantMappingService.findMerchant(
        transaction.description
      );
      
      if (merchantInfo?.category) {
        const result = {
          category: merchantInfo.category as Category,
          confidence: 0.9,
          metadata: {
            source: 'merchant_mapping',
            isBusinessVendor: merchantInfo.isBusinessVendor
          }
        };
        await this.cache.set(cacheKey, JSON.stringify(result));
        return result;
      }

      // Apply rules
      const bestMatch = this.findBestMatchingRule(transaction);
      if (bestMatch && bestMatch.confidence > this.CONFIDENCE_THRESHOLD) {
        const result = {
          category: bestMatch.category,
          confidence: bestMatch.confidence,
          metadata: {
            source: 'rules',
            rule: bestMatch.pattern.toString()
          }
        };
        await this.cache.set(cacheKey, JSON.stringify(result));
        return result;
      }

      // Fallback to ML prediction
      const prediction = await this.predictCategory(transaction);
      await this.cache.set(cacheKey, JSON.stringify(prediction));
      return prediction;

    } catch (error) {
      Logger.error('Categorization failed:', error);
      return {
        category: 'uncategorized',
        confidence: 0,
        metadata: { error: error.message }
      };
    } finally {
      const duration = performance.now() - startTime;
      await this.metrics.recordMetric('categorization.duration', duration);
    }
  }

  async batchCategorize(transactions: BankTransaction[]): Promise<Map<string, Category>> {
    const results = new Map<string, Category>();
    const chunks = this.chunkArray(transactions, 50);

    for (const chunk of chunks) {
      const promises = chunk.map(async tx => {
        const { category } = await this.categorizeTransaction(tx);
        results.set(tx.id, category);
      });

      await Promise.all(promises);
    }

    return results;
  }

  private async predictCategory(transaction: BankTransaction) {
    // TODO: Implement ML-based prediction
    // This would typically use a trained model
    return {
      category: 'uncategorized' as Category,
      confidence: 0.5,
      metadata: {
        source: 'ml_prediction'
      }
    };
  }

  private findBestMatchingRule(transaction: BankTransaction) {
    let bestMatch: CategoryRule | null = null;
    let highestConfidence = 0;

    for (const rule of this.rules) {
      const matches = typeof rule.pattern === 'string'
        ? transaction.description.toLowerCase().includes(rule.pattern.toLowerCase())
        : rule.pattern.test(transaction.description);

      if (matches && rule.confidence > highestConfidence) {
        bestMatch = rule;
        highestConfidence = rule.confidence;
      }
    }

    return bestMatch;
  }

  private initializeRules() {
    this.rules = [
      {
        pattern: /\b(netflix|spotify|hulu|disney\+)\b/i,
        category: 'subscriptions',
        confidence: 0.95,
        metadata: { isRecurring: true }
      },
      {
        pattern: /\b(uber|lyft|taxi|cab)\b/i,
        category: 'transportation',
        confidence: 0.9
      },
      // Add more rules...
    ];
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const transactionCategorizer = new TransactionCategorizerService(); 