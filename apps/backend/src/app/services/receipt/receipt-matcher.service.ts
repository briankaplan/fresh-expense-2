import {
  type BaseTransactionData,
  type ReceiptDocument,
  type ReceiptMatchResult,
  ReceiptMetadata,
} from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  calculateStringSimilarity,
  normalizeText,
} from "@packages/utils/src/string/string-comparison";
import type { Model } from "mongoose";

import {
  Transaction,
  type TransactionDocument,
} from "../../transactions/schemas/transaction.schema";

interface MatchResult {
  receipt: ReceiptDocument;
  transaction: BaseTransactionData;
  confidence: number;
  matchDetails: {
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    locationScore?: number;
    categoryScore?: number;
    paymentMethodScore?: number;
    textScore?: number;
    patternScore?: number;
    frequencyScore?: number;
  };
}

interface MatchingPreferences {
  weights: {
    merchant: number;
    amount: number;
    date: number;
    location: number;
    category: number;
    paymentMethod: number;
    text: number;
    pattern: number;
    frequency: number;
  };
  amountTolerance: number;
  dateRangeDays: number;
  merchantMatchThreshold: number;
  locationRadiusKm: number;
  patternMatchThreshold: number;
  frequencyWeight: number;
}

@Injectable()
export class ReceiptMatcherService {
  private readonly logger = new Logger(ReceiptMatcherService.name);
  private readonly defaultPreferences: MatchingPreferences = {
    weights: {
      merchant: 0.3,
      amount: 0.25,
      date: 0.15,
      location: 0.1,
      category: 0.05,
      paymentMethod: 0.05,
      text: 0.05,
      pattern: 0.05,
      frequency: 0.05,
    },
    amountTolerance: 0.1,
    dateRangeDays: 3,
    merchantMatchThreshold: 0.8,
    locationRadiusKm: 0.5,
    patternMatchThreshold: 0.7,
    frequencyWeight: 0.1,
  };

  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async findMatchesForReceipt(
    receipt: ReceiptDocument,
    transactions: BaseTransactionData[],
    preferences: Partial<MatchingPreferences> = {},
  ): Promise<MatchResult[]> {
    const finalPreferences = { ...this.defaultPreferences, ...preferences };
    const matches: MatchResult[] = [];

    // Pre-process transactions for pattern matching
    const transactionPatterns = this.extractTransactionPatterns(transactions);

    for (const transaction of transactions) {
      const matchDetails = await this.calculateMatchDetails(
        receipt,
        transaction,
        finalPreferences,
        transactionPatterns,
      );
      const confidence = this.calculateTotalScore(matchDetails, finalPreferences.weights);

      if (confidence >= finalPreferences.merchantMatchThreshold) {
        matches.push({
          receipt,
          transaction,
          confidence,
          matchDetails,
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private async calculateMatchDetails(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
    preferences: MatchingPreferences,
    transactionPatterns: Map<string, number>,
  ): Promise<MatchResult["matchDetails"]> {
    return {
      merchantScore: this.calculateMerchantScore(
        receipt.merchant,
        transaction.merchantName,
        preferences,
      ),
      amountScore: this.calculateAmountScore(
        receipt.amount,
        transaction.amount,
        preferences.amountTolerance,
      ),
      dateScore: this.calculateDateScore(receipt.date, transaction.date, preferences.dateRangeDays),
      locationScore: this.calculateLocationScore(
        receipt,
        transaction,
        preferences.locationRadiusKm,
      ),
      categoryScore: this.calculateCategoryScore(receipt, transaction),
      paymentMethodScore: this.calculatePaymentMethodScore(receipt, transaction),
      textScore: this.calculateTextScore(receipt, transaction),
      patternScore: this.calculatePatternScore(
        receipt,
        transaction,
        transactionPatterns,
        preferences.patternMatchThreshold,
      ),
      frequencyScore: this.calculateFrequencyScore(
        receipt,
        transaction,
        transactionPatterns,
        preferences.frequencyWeight,
      ),
    };
  }

  private calculateMerchantScore(
    receiptMerchant: string,
    transactionMerchant: string,
    preferences: MatchingPreferences,
  ): number {
    const normalized1 = normalizeText(receiptMerchant);
    const normalized2 = normalizeText(transactionMerchant);

    if (normalized1 === normalized2) return 1;
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return 0.8;

    // Enhanced merchant matching with common abbreviations and patterns
    const commonPatterns = [
      { pattern: /inc\.?/i, replacement: "incorporated" },
      { pattern: /llc\.?/i, replacement: "limited liability company" },
      { pattern: /corp\.?/i, replacement: "corporation" },
      { pattern: /co\.?/i, replacement: "company" },
      { pattern: /ltd\.?/i, replacement: "limited" },
    ];

    let processed1 = normalized1;
    let processed2 = normalized2;

    for (const { pattern, replacement } of commonPatterns) {
      processed1 = processed1.replace(pattern, replacement);
      processed2 = processed2.replace(pattern, replacement);
    }

    return calculateStringSimilarity(processed1, processed2);
  }

  private calculateAmountScore(
    receiptAmount: number,
    transactionAmount: number,
    tolerance: number,
  ): number {
    if (receiptAmount === transactionAmount) return 1;

    const difference = Math.abs(receiptAmount - transactionAmount);
    const percentDifference = difference / Math.max(receiptAmount, transactionAmount);

    if (percentDifference <= tolerance) {
      // Use a sigmoid function for smoother scoring
      return 1 / (1 + Math.exp(10 * (percentDifference / tolerance - 0.5)));
    }

    return 0;
  }

  private calculateDateScore(
    receiptDate: Date,
    transactionDate: Date,
    maxDaysDifference: number,
  ): number {
    const diffInDays =
      Math.abs(receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays === 0) return 1;
    if (diffInDays <= 1) return 0.9;
    if (diffInDays <= maxDaysDifference) {
      // Use a sigmoid function for smoother date scoring
      return 1 / (1 + Math.exp(5 * (diffInDays / maxDaysDifference - 0.5)));
    }

    return 0;
  }

  private calculateLocationScore(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
    radiusKm: number,
  ): number {
    if (!receipt.metadata?.location || !transaction.metadata?.location) return 0;

    const location1 = receipt.metadata.location as {
      latitude: number;
      longitude: number;
    };
    const location2 = transaction.metadata.location as {
      latitude: number;
      longitude: number;
    };

    // Add null checks for coordinates
    if (
      typeof location1.latitude !== "number" ||
      typeof location1.longitude !== "number" ||
      typeof location2.latitude !== "number" ||
      typeof location2.longitude !== "number"
    ) {
      return 0;
    }

    const distance = this.calculateHaversineDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude,
    );
    if (distance <= radiusKm) {
      // Use a sigmoid function for smoother distance scoring
      return 1 / (1 + Math.exp(5 * (distance / radiusKm - 0.5)));
    }

    return 0;
  }

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateCategoryScore(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
  ): number {
    if (!receipt.category || !transaction.category) return 0;
    return receipt.category === transaction.category ? 1 : 0;
  }

  private calculatePaymentMethodScore(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
  ): number {
    if (!receipt.metadata?.paymentMethod || !transaction.metadata?.paymentMethod) return 0;
    return receipt.metadata.paymentMethod === transaction.metadata.paymentMethod ? 1 : 0;
  }

  private calculateTextScore(receipt: ReceiptDocument, transaction: BaseTransactionData): number {
    // Use the ocrText property from metadata
    if (!receipt.metadata?.ocrText || !transaction.description) return 0;
    return calculateStringSimilarity(
      normalizeText(receipt.metadata.ocrText),
      normalizeText(transaction.description),
    );
  }

  private extractTransactionPatterns(transactions: BaseTransactionData[]): Map<string, number> {
    const patterns = new Map<string, number>();

    // Group transactions by merchant and calculate frequency
    const merchantFrequency = new Map<string, number>();
    for (const transaction of transactions) {
      const merchant = normalizeText(transaction.merchantName);
      merchantFrequency.set(merchant, (merchantFrequency.get(merchant) || 0) + 1);
    }

    // Calculate pattern scores based on frequency
    for (const [merchant, frequency] of merchantFrequency) {
      patterns.set(merchant, frequency / transactions.length);
    }

    return patterns;
  }

  private calculatePatternScore(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
    patterns: Map<string, number>,
    threshold: number,
  ): number {
    const merchant = normalizeText(transaction.merchantName);
    const patternScore = patterns.get(merchant) || 0;
    return patternScore >= threshold ? patternScore : 0;
  }

  private calculateFrequencyScore(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
    patterns: Map<string, number>,
    weight: number,
  ): number {
    const merchant = normalizeText(transaction.merchantName);
    const frequency = patterns.get(merchant) || 0;
    return frequency * weight;
  }

  private calculateTotalScore(
    matchDetails: MatchResult["matchDetails"],
    weights: MatchingPreferences["weights"],
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = matchDetails[`${key}Score` as keyof MatchResult["matchDetails"]] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  async matchReceiptToTransaction(
    receipt: ReceiptDocument,
    userId: string,
    preferences: {
      matchAmount: boolean;
      matchDate: boolean;
      matchMerchant: boolean;
    },
  ): Promise<ReceiptMatchResult> {
    const query: any = { userId };

    if (preferences.matchAmount && receipt.amount) {
      query.amount = receipt.amount;
    }

    if (preferences.matchDate && receipt.date) {
      const date = new Date(receipt.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (preferences.matchMerchant && receipt.merchant) {
      query.merchant = receipt.merchant;
    }

    const transactions = await this.transactionModel.find(query).exec();

    if (transactions.length === 0) {
      return {
        matched: false,
        confidence: 0,
        transaction: null,
      };
    }

    // Calculate confidence score based on matched fields
    const matchedTransaction = transactions[0];
    let confidence = 0;
    let matchedFields = 0;

    if (preferences.matchAmount && receipt.amount === matchedTransaction.amount) {
      confidence += 0.4;
      matchedFields++;
    }

    if (preferences.matchDate && receipt.date) {
      const receiptDate = new Date(receipt.date);
      const transactionDate = new Date(matchedTransaction.date);
      if (receiptDate.toDateString() === transactionDate.toDateString()) {
        confidence += 0.3;
        matchedFields++;
      }
    }

    if (preferences.matchMerchant && receipt.merchant === matchedTransaction.merchant) {
      confidence += 0.3;
      matchedFields++;
    }

    // Normalize confidence score
    confidence = confidence / matchedFields;

    return {
      matched: confidence >= 0.5,
      confidence,
      transaction: matchedTransaction,
    };
  }

  async processReceipt(
    receipt: ReceiptDocument,
    userId: string,
    preferences: {
      matchAmount: boolean;
      matchDate: boolean;
      matchMerchant: boolean;
    },
  ): Promise<ReceiptMatchResult> {
    return this.matchReceiptToTransaction(receipt, userId, preferences);
  }
}
