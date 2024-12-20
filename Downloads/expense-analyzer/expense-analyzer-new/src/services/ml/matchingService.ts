'use client';

import { BaseService } from '../db/baseService';
import { BankTransaction, ProcessedReceipt } from '@/types';
import { areMerchantsRelated } from '@/utils/merchantMatching';
import { CacheService } from '../cache/cacheService';
import { MetricsService } from '../metrics/metricsService';

interface MatchFeatures {
  amountDifference: number;
  dateDifference: number;
  merchantSimilarity: number;
  categoryMatch: boolean;
  timeOfDay: number;
  dayOfWeek: number;
  isRoundAmount: boolean;
}

interface MatchResult {
  receipt: ProcessedReceipt;
  transaction: BankTransaction;
  confidence: number;
  features: MatchFeatures;
  explanation: string[];
}

export class MLMatchingService extends BaseService {
  private cache: CacheService<MatchResult[]>;
  private metrics: MetricsService;
  private modelWeights: Record<keyof MatchFeatures, number>;

  constructor() {
    super();
    this.cache = new CacheService({ ttl: 1000 * 60 * 30 }); // 30 min cache
    this.metrics = new MetricsService();
    
    // Initial weights based on historical performance
    this.modelWeights = {
      amountDifference: 0.4,
      dateDifference: 0.25,
      merchantSimilarity: 0.2,
      categoryMatch: 0.05,
      timeOfDay: 0.05,
      dayOfWeek: 0.025,
      isRoundAmount: 0.025
    };
  }

  async findMatches(
    receipt: ProcessedReceipt,
    transactions: BankTransaction[],
    options: {
      minConfidence?: number;
      maxMatches?: number;
      useCache?: boolean;
    } = {}
  ): Promise<MatchResult[]> {
    const {
      minConfidence = 0.7,
      maxMatches = 3,
      useCache = true
    } = options;

    const cacheKey = `match:${receipt.id}:${transactions.map(t => t.id).join(',')}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const startTime = Date.now();
    const matches = await this.executeWithRetry(
      async () => {
        // Calculate features and scores for all potential matches
        const results = await Promise.all(
          transactions.map(async transaction => {
            const features = await this.extractFeatures(receipt, transaction);
            const confidence = this.calculateConfidence(features);
            const explanation = this.generateExplanation(features, confidence);

            return {
              receipt,
              transaction,
              confidence,
              features,
              explanation
            };
          })
        );

        // Filter and sort matches
        const matches = results
          .filter(match => match.confidence >= minConfidence)
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, maxMatches);

        // Record metrics
        await this.recordMatchingMetrics(matches, Date.now() - startTime);

        return matches;
      },
      {
        errorCode: 'MATCHING_FAILED',
        errorMessage: 'Failed to find matches',
        context: { receiptId: receipt.id }
      }
    );

    if (useCache) {
      await this.cache.set(cacheKey, matches);
    }

    return matches;
  }

  private async extractFeatures(
    receipt: ProcessedReceipt,
    transaction: BankTransaction
  ): Promise<MatchFeatures> {
    const receiptDate = new Date(receipt.ocrData.date);
    const transactionDate = new Date(transaction.date);

    return {
      amountDifference: Math.abs(receipt.ocrData.total - Math.abs(transaction.amount)),
      dateDifference: Math.abs(receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
      merchantSimilarity: await this.calculateMerchantSimilarity(receipt.ocrData.merchant, transaction.description),
      categoryMatch: this.categoriesMatch(receipt.ocrData.category, transaction.category),
      timeOfDay: receiptDate.getHours() / 24,
      dayOfWeek: receiptDate.getDay() / 7,
      isRoundAmount: this.isRoundAmount(receipt.ocrData.total)
    };
  }

  private async calculateMerchantSimilarity(
    merchant1: string,
    merchant2: string
  ): Promise<number> {
    const cacheKey = `merchant:${merchant1}:${merchant2}`;
    
    return this.cache.getOrSet(cacheKey, async () => {
      // Use merchant matching utility with additional refinements
      if (areMerchantsRelated(merchant1, merchant2)) {
        return 1;
      }

      // Calculate Levenshtein distance-based similarity
      const distance = this.calculateLevenshteinDistance(
        merchant1.toLowerCase(),
        merchant2.toLowerCase()
      );
      const maxLength = Math.max(merchant1.length, merchant2.length);
      return 1 - (distance / maxLength);
    });
  }

  private calculateConfidence(features: MatchFeatures): number {
    let confidence = 0;

    // Amount difference (exponential decay)
    confidence += this.modelWeights.amountDifference * 
      Math.exp(-5 * features.amountDifference);

    // Date difference (exponential decay)
    confidence += this.modelWeights.dateDifference * 
      Math.exp(-0.5 * features.dateDifference);

    // Merchant similarity (linear)
    confidence += this.modelWeights.merchantSimilarity * 
      features.merchantSimilarity;

    // Category match (binary)
    confidence += this.modelWeights.categoryMatch * 
      (features.categoryMatch ? 1 : 0);

    // Time patterns (gaussian)
    confidence += this.modelWeights.timeOfDay * 
      this.gaussianKernel(features.timeOfDay, 0.5, 0.2);
    confidence += this.modelWeights.dayOfWeek * 
      this.gaussianKernel(features.dayOfWeek, 0.5, 0.2);

    // Round amount penalty
    confidence += this.modelWeights.isRoundAmount * 
      (features.isRoundAmount ? -0.1 : 0);

    return Math.max(0, Math.min(1, confidence));
  }

  private generateExplanation(
    features: MatchFeatures,
    confidence: number
  ): string[] {
    const explanations: string[] = [];

    if (features.amountDifference < 0.01) {
      explanations.push('Exact amount match');
    } else if (features.amountDifference < 0.1) {
      explanations.push('Very close amount match');
    }

    if (features.dateDifference < 1) {
      explanations.push('Same day transaction');
    } else if (features.dateDifference < 3) {
      explanations.push(`Transaction within ${Math.ceil(features.dateDifference)} days`);
    }

    if (features.merchantSimilarity > 0.9) {
      explanations.push('Strong merchant name match');
    } else if (features.merchantSimilarity > 0.7) {
      explanations.push('Possible merchant name match');
    }

    if (features.categoryMatch) {
      explanations.push('Matching categories');
    }

    return explanations;
  }

  private async recordMatchingMetrics(
    matches: MatchResult[],
    duration: number
  ): Promise<void> {
    await Promise.all([
      this.metrics.recordMetric('matching.duration', duration),
      this.metrics.recordMetric('matching.count', matches.length),
      this.metrics.recordMetric(
        'matching.confidence.avg',
        matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
      )
    ]);
  }

  private calculateLevenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(
              Math.min(newValue, lastValue),
              costs[j]
            ) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  private gaussianKernel(x: number, mu: number, sigma: number): number {
    return Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
  }

  private categoriesMatch(cat1?: string, cat2?: string): boolean {
    if (!cat1 || !cat2) return false;
    return cat1.toLowerCase() === cat2.toLowerCase();
  }

  private isRoundAmount(amount: number): boolean {
    return amount % 1 === 0 || amount % 5 === 0;
  }

  // Method to update model weights based on feedback
  async updateModelWeights(
    matchResult: MatchResult,
    wasCorrect: boolean
  ): Promise<void> {
    const learningRate = 0.01;
    const direction = wasCorrect ? 1 : -1;

    // Update weights based on feature importance
    Object.keys(this.modelWeights).forEach(key => {
      const featureKey = key as keyof MatchFeatures;
      const featureValue = matchResult.features[featureKey];
      const update = direction * learningRate * featureValue;
      this.modelWeights[featureKey] += update;
    });

    // Normalize weights
    const sum = Object.values(this.modelWeights).reduce((a, b) => a + b, 0);
    Object.keys(this.modelWeights).forEach(key => {
      this.modelWeights[key as keyof MatchFeatures] /= sum;
    });

    // Record learning metrics
    await this.metrics.recordMetric('matching.learning', wasCorrect ? 1 : 0);
  }
} 