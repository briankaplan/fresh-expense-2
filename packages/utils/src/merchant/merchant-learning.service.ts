import { Injectable, Logger } from '@nestjs/common';
import {
  MerchantLearningData,
  MerchantLearningResult,
  MerchantLearningConfig,
  MerchantSource,
} from '@fresh-expense/types';

@Injectable()
export class MerchantLearningService {
  private readonly logger = new Logger(MerchantLearningService.name);
  private config: MerchantLearningConfig = {
    minConfidence: 0.7,
    minTransactions: 3,
    categoryWeights: {
      manual: 1.0,
      ocr: 0.9,
      transaction: 0.8,
      api: 0.7,
    },
  };

  async learnFromData(data: MerchantLearningData): Promise<MerchantLearningResult> {
    if (!data.merchantName || !data.userId) {
      throw new Error('Merchant name and user ID are required');
    }

    // Normalize confidence to be between 0 and 1
    const normalizedConfidence = Math.max(0, Math.min(1, data.confidence || 0));

    const baseConfidence = this.calculateBaseConfidence(data.source, normalizedConfidence);
    const transactionCount = data.metadata?.transactionCount || 0;
    const finalConfidence = this.adjustConfidenceForTransactions(baseConfidence, transactionCount);

    const result: MerchantLearningResult = {
      merchantName: data.merchantName,
      userId: data.userId,
      category: data.category || 'uncategorized',
      confidence: finalConfidence,
      tags: data.metadata?.tags || [],
      metadata: {
        transactionCount,
        source: data.source,
        originalConfidence: normalizedConfidence,
        lastUpdated: new Date(),
      },
    };

    this.logger.debug(`Learned merchant data: ${JSON.stringify(result)}`);
    return result;
  }

  updateConfig(newConfig: Partial<MerchantLearningConfig>): void {
    // Validate and normalize config values
    const normalizedConfig: Partial<MerchantLearningConfig> = {
      minConfidence: newConfig.minConfidence
        ? Math.max(0, Math.min(1, newConfig.minConfidence))
        : undefined,
      minTransactions: newConfig.minTransactions
        ? Math.max(0, newConfig.minTransactions)
        : undefined,
      categoryWeights: newConfig.categoryWeights
        ? Object.fromEntries(
            Object.entries(newConfig.categoryWeights).map(([key, value]) => [
              key as MerchantSource,
              Math.max(0, Math.min(1, value)),
            ]),
          ) as Record<MerchantSource, number>
        : this.config.categoryWeights,
    };

    this.config = {
      ...this.config,
      ...normalizedConfig,
    };
    this.logger.debug(`Updated merchant learning config: ${JSON.stringify(this.config)}`);
  }

  private calculateBaseConfidence(source: MerchantSource, inputConfidence: number): number {
    const sourceWeight = this.config.categoryWeights[source] || 0.7;
    // Apply the source weight as a multiplier to the input confidence
    return inputConfidence * sourceWeight;
  }

  private adjustConfidenceForTransactions(
    baseConfidence: number,
    transactionCount: number,
  ): number {
    if (transactionCount >= this.config.minTransactions) {
      const confidenceBoost = Math.min(
        0.2,
        (transactionCount - this.config.minTransactions) * 0.05,
      );
      return Math.min(1, baseConfidence + confidenceBoost);
    }
    return baseConfidence;
  }
}
