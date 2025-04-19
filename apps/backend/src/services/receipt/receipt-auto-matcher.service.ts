import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReceiptDocument } from '@fresh-expense/types';
import { TransactionDocument } from '@fresh-expense/types';
import { NotificationService } from '../notification/notification.service';
import { stringSimilarity } from 'string-similarity';
import { CircuitBreaker } from '@fresh-expense/utils';
import { MetricsService } from '../metrics/metrics.service';
import { CacheService } from '../cache/cache.service';

interface MatchMetrics {
  successRate: number;
  averageConfidence: number;
  processingTime: number;
  falsePositiveRate: number;
}

@Injectable()
export class ReceiptAutoMatcherService {
  private readonly logger = new Logger(ReceiptAutoMatcherService.name);
  private readonly circuitBreaker: CircuitBreaker;
  private readonly DEFAULT_MATCH_THRESHOLD = 0.8;
  private readonly DEFAULT_DATE_RANGE_DAYS = 7;
  private readonly DEFAULT_AMOUNT_TOLERANCE = 0.1;
  private readonly BATCH_SIZE = 100;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
    @InjectModel('Transaction') private transactionModel: Model<TransactionDocument>,
    private notificationService: NotificationService,
    private metricsService: MetricsService,
    private cacheService: CacheService
  ) {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
    });
  }

  async onNewTransaction(transaction: TransactionDocument): Promise<void> {
    try {
      this.logger.log(`Processing new transaction for matching: ${transaction._id}`);

      const unmatchedReceipts = await this.findUnmatchedReceipts({
        userId: transaction.userId.toString(),
        dateRange: {
          start: new Date(
            transaction.date.getTime() - this.DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
          ),
          end: new Date(
            transaction.date.getTime() + this.DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
          ),
        },
        amountRange: {
          min: transaction.amount * (1 - this.DEFAULT_AMOUNT_TOLERANCE),
          max: transaction.amount * (1 + this.DEFAULT_AMOUNT_TOLERANCE),
        },
      });

      this.logger.log(`Found ${unmatchedReceipts.length} potential matches`);

      for (const receipt of unmatchedReceipts) {
        await this.processReceiptMatch(receipt, transaction);
      }
    } catch (error) {
      this.logger.error('Error in onNewTransaction:', error);
      this.metricsService.recordError('onNewTransaction', error);
      throw error;
    }
  }

  async periodicMatching(): Promise<void> {
    try {
      this.logger.log('Starting periodic receipt matching');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const unmatchedReceipts = await this.findUnmatchedReceipts({
        olderThan: thirtyDaysAgo,
      });

      this.logger.log(`Found ${unmatchedReceipts.length} unmatched receipts`);

      // Process in batches
      for (let i = 0; i < unmatchedReceipts.length; i += this.BATCH_SIZE) {
        const batch = unmatchedReceipts.slice(i, i + this.BATCH_SIZE);
        await Promise.all(batch.map(receipt => this.processReceipt(receipt)));
      }
    } catch (error) {
      this.logger.error('Error in periodicMatching:', error);
      this.metricsService.recordError('periodicMatching', error);
      throw error;
    }
  }

  private async processReceipt(receipt: ReceiptDocument): Promise<void> {
    try {
      const potentialMatches = await this.findPotentialTransactions({
        userId: receipt.userId.toString(),
        dateRange: {
          start: new Date(
            receipt.uploadDate.getTime() - this.DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
          ),
          end: new Date(
            receipt.uploadDate.getTime() + this.DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
          ),
        },
        amountRange: {
          min: receipt.amount * (1 - this.DEFAULT_AMOUNT_TOLERANCE),
          max: receipt.amount * (1 + this.DEFAULT_AMOUNT_TOLERANCE),
        },
      });

      for (const transaction of potentialMatches) {
        const matchResult = await this.processReceiptMatch(receipt, transaction);
        if (matchResult.matched) {
          break; // Stop after first high-confidence match
        }
      }
    } catch (error) {
      this.logger.error(`Error processing receipt ${receipt._id}:`, error);
      this.metricsService.recordError('processReceipt', error);
    }
  }

  private async processReceiptMatch(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): Promise<{ matched: boolean; confidence: number }> {
    const startTime = Date.now();
    try {
      const matchScore = await this.calculateMatchScore(receipt, transaction);
      const matchThreshold = receipt.matchingPreferences?.weights
        ? this.calculateThreshold(receipt.matchingPreferences.weights)
        : this.DEFAULT_MATCH_THRESHOLD;

      await this.recordMatchAttempt(receipt, transaction, matchScore);

      if (matchScore >= matchThreshold) {
        await this.processMatch(receipt, transaction, matchScore);
        this.metricsService.recordMatchSuccess(matchScore, Date.now() - startTime);
        return { matched: true, confidence: matchScore };
      } else if (matchScore >= matchThreshold * 0.7) {
        // Send to review queue for low-confidence matches
        await this.sendToReview(receipt, transaction, matchScore);
      }

      this.metricsService.recordMatchAttempt(matchScore, Date.now() - startTime);
      return { matched: false, confidence: matchScore };
    } catch (error) {
      this.logger.error('Error in processReceiptMatch:', error);
      this.metricsService.recordError('processReceiptMatch', error);
      throw error;
    }
  }

  private async calculateMatchScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): Promise<number> {
    const preferences = receipt.matchingPreferences || {
      weights: {
        amount: { value: 0.4, currency: "USD" },
        date: 0.3,
        merchant: 0.3,
        location: 0,
        category: 0,
        paymentMethod: 0,
      },
    };

    const factors = {
      amount: this.calculateAmountScore(receipt, transaction, preferences.amountTolerance),
      date: this.calculateDateScore(receipt, transaction, preferences.dateRangeDays),
      merchant: this.calculateMerchantScore(receipt, transaction),
      location: this.calculateLocationScore(receipt, transaction),
      category: this.calculateCategoryScore(receipt, transaction),
      paymentMethod: this.calculatePaymentMethodScore(receipt, transaction),
    };

    let score = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(preferences.weights)) {
      if (weight > 0 && factors[factor] !== undefined) {
        score += factors[factor] * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private calculateAmountScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument,
    tolerance: number = this.DEFAULT_AMOUNT_TOLERANCE
  ): number {
    const amountDiff = Math.abs(receipt.amount - transaction.amount);
    return 1 - amountDiff / Math.max(receipt.amount, transaction.amount);
  }

  private calculateDateScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument,
    rangeDays: number = this.DEFAULT_DATE_RANGE_DAYS
  ): number {
    const dateDiff = Math.abs(receipt.uploadDate.getTime() - transaction.date.getTime());
    const maxDateDiff = rangeDays * 24 * 60 * 60 * 1000;
    return 1 - dateDiff / maxDateDiff;
  }

  private calculateMerchantScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): number {
    const cachedScore = this.cacheService.get(
      `merchant:${receipt.merchant}:${transaction.merchant}`
    );
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    const score = stringSimilarity.compareTwoStrings(
      receipt.merchant.toLowerCase(),
      transaction.merchant?.toLowerCase() || ''
    );

    this.cacheService.set(
      `merchant:${receipt.merchant}:${transaction.merchant}`,
      score,
      this.CACHE_TTL
    );
    return score;
  }

  private calculateLocationScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): number {
    if (!receipt.metadata?.location || !transaction.location) {
      return 0;
    }

    const distance = this.calculateDistance(
      receipt.metadata.location.latitude,
      receipt.metadata.location.longitude,
      transaction.location.latitude,
      transaction.location.longitude
    );

    // Score decreases with distance, max score at 0km, 0 score at 10km
    return Math.max(0, 1 - distance / 10000);
  }

  private calculateCategoryScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): number {
    if (!receipt.metadata?.category || !transaction.category) {
      return 0;
    }

    return stringSimilarity.compareTwoStrings(
      receipt.metadata.category.toLowerCase(),
      transaction.category.toLowerCase()
    );
  }

  private calculatePaymentMethodScore(
    receipt: ReceiptDocument,
    transaction: TransactionDocument
  ): number {
    if (!receipt.metadata?.paymentMethod || !transaction.paymentMethod) {
      return 0;
    }

    return receipt.metadata.paymentMethod != null ? 1 : 0;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private calculateThreshold(weights: Record<string, number>): number {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    return totalWeight > 0
      ? this.DEFAULT_MATCH_THRESHOLD * (totalWeight / 1)
      : this.DEFAULT_MATCH_THRESHOLD;
  }

  private async sendToReview(
    receipt: ReceiptDocument,
    transaction: TransactionDocument,
    confidence: number
  ): Promise<void> {
    await this.receiptModel.updateOne(
      { _id: receipt._id },
      {
        $set: {
          matchStatus: 'review',
          matchConfidence: confidence,
        },
      }
    );

    await this.notificationService.sendReviewNotification(receipt.userId.toString(), {
      receiptId: receipt._id.toString(),
      transactionId: transaction._id.toString(),
      confidence,
      merchant: receipt.merchant,
      amount: receipt.amount,
      date: receipt.uploadDate,
    });
  }

  private async recordMatchAttempt(
    receipt: ReceiptDocument,
    transaction: TransactionDocument,
    confidence: number
  ): Promise<void> {
    const factors = {
      amount: this.calculateAmountScore(receipt, transaction),
      date: this.calculateDateScore(receipt, transaction),
      merchant: this.calculateMerchantScore(receipt, transaction),
      location: this.calculateLocationScore(receipt, transaction),
      category: this.calculateCategoryScore(receipt, transaction),
      paymentMethod: this.calculatePaymentMethodScore(receipt, transaction),
    };

    await this.receiptModel.updateOne(
      { _id: receipt._id },
      {
        $set: { lastMatchAttempt: new Date() },
        $push: {
          matchHistory: {
            transactionId: transaction._id,
            confidence,
            attemptedAt: new Date(),
            factors,
          },
        },
      }
    );
  }

  private async processMatch(
    receipt: ReceiptDocument,
    transaction: TransactionDocument,
    confidence: number
  ): Promise<void> {
    await this.receiptModel.updateOne(
      { _id: receipt._id },
      {
        $set: {
          matchStatus: 'matched',
          matchConfidence: confidence,
          transactionId: transaction._id,
        },
      }
    );

    await this.notificationService.sendMatchNotification(receipt.userId.toString(), {
      receiptId: receipt._id.toString(),
      transactionId: transaction._id.toString(),
      confidence,
      merchant: receipt.merchant,
      amount: receipt.amount,
      date: receipt.uploadDate,
    });
  }

  async getMatchMetrics(userId: string): Promise<MatchMetrics> {
    const receipts = await this.receiptModel.find({ userId }).exec();

    const successfulMatches = receipts.filter(r => r.matchStatus != null);
    const totalAttempts = receipts.reduce((sum, r) => sum + (r.matchHistory?.length || 0), 0);
    const falsePositives = receipts.filter(r => r.userFeedback?.isCorrect != null).length;

    return {
      successRate: successfulMatches.length / receipts.length,
      averageConfidence:
        successfulMatches.reduce((sum, r) => sum + (r.matchConfidence || 0), 0) /
        successfulMatches.length,
      processingTime: await this.metricsService.getAverageProcessingTime(),
      falsePositiveRate: falsePositives / successfulMatches.length,
    };
  }
}
