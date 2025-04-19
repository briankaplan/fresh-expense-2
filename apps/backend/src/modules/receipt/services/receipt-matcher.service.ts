import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReceiptDocument } from '@fresh-expense/types';

export interface ReceiptSearchOptions {
  userId: string;
  query?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  tags?: string[];
  source?: string;
  fuzzyMatch?: boolean;
  limit?: number;
  offset?: number;
}

export interface MatchResult {
  receipt: ReceiptDocument;
  score: number;
  matchDetails: {
    merchantMatch: number;
    amountMatch: number;
    dateMatch: number;
    categoryMatch?: number;
    textMatch?: number;
  };
}

@Injectable()
export class ReceiptMatcherService {
  private readonly logger = new Logger(ReceiptMatcherService.name);

  constructor(@InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>) {}

  async findSimilar(
    receipt: ReceiptDocument,
    options: { threshold?: number; maxResults?: number } = {}
  ): Promise<MatchResult[]> {
    const { threshold = 0.7, maxResults = 5 } = options;

    try {
      // Find potential matches based on amount and date
      const query = {
        userId: receipt.userId,
        _id: { $ne: receipt._id },
        amount: {
          $gte: receipt.amount * 0.9,
          $lte: receipt.amount * 1.1,
        },
        date: {
          $gte: new Date(receipt.date.getTime() - 3 * 24 * 60 * 60 * 1000),
          $lte: new Date(receipt.date.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      };

      const potentialMatches = await this.receiptModel.find(query).exec();
      const results: MatchResult[] = [];

      for (const match of potentialMatches) {
        const score = await this.calculateMatchScore(receipt, match);
        if (score.score >= threshold) {
          results.push(score);
        }
      }

      return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
    } catch (error) {
      this.logger.error('Error finding similar receipts:', error);
      throw error;
    }
  }

  async search(options: ReceiptSearchOptions): Promise<ReceiptDocument[]> {
    try {
      const query: any = { userId: new Types.ObjectId(options.userId) };

      if (options.query) {
        if (options.fuzzyMatch) {
          const searchRegex = new RegExp(options.query.split('').join('.*'), 'i');
          query.$or = [
            { merchant: searchRegex },
            { 'metadata.text': searchRegex },
            { 'ocrData.text': searchRegex },
          ];
        } else {
          query.$text = { $search: options.query };
        }
      }

      if (options.merchant) {
        query.merchant = options.fuzzyMatch ? new RegExp(options.merchant, 'i') : options.merchant;
      }

      if (options.minAmount !== undefined || options.maxAmount !== undefined) {
        query.amount = {};
        if (options.minAmount !== undefined) query.amount.$gte = options.minAmount;
        if (options.maxAmount !== undefined) query.amount.$lte = options.maxAmount;
      }

      if (options.startDate || options.endDate) {
        query.date = {};
        if (options.startDate) query.date.$gte = options.startDate;
        if (options.endDate) query.date.$lte = options.endDate;
      }

      if (options.categories?.length) {
        query.category = { $in: options.categories };
      }

      if (options.tags?.length) {
        query.tags = { $all: options.tags };
      }

      if (options.source) {
        query.source = options.source;
      }

      return this.receiptModel
        .find(query)
        .sort({ date: -1 })
        .skip(options.offset || 0)
        .limit(options.limit || 50)
        .exec();
    } catch (error) {
      this.logger.error('Error searching receipts:', error);
      throw error;
    }
  }

  private async calculateMatchScore(
    receipt1: ReceiptDocument,
    receipt2: ReceiptDocument
  ): Promise<MatchResult> {
    const merchantMatch = this.calculateMerchantSimilarity(receipt1.merchant, receipt2.merchant);
    const amountMatch = this.calculateAmountSimilarity(receipt1.amount, receipt2.amount);
    const dateMatch = this.calculateDateSimilarity(receipt1.date, receipt2.date);
    const categoryMatch = receipt1.category != null ? 1 : 0;

    let textMatch = 0;
    if (receipt1.ocrData?.text && receipt2.ocrData?.text) {
      textMatch = this.calculateTextSimilarity(receipt1.ocrData.text, receipt2.ocrData.text);
    }

    const score =
      merchantMatch * 0.4 +
      amountMatch * 0.3 +
      dateMatch * 0.2 +
      (categoryMatch || 0) * 0.05 +
      textMatch * 0.05;

    return {
      receipt: receipt2,
      score,
      matchDetails: {
        merchantMatch,
        amountMatch,
        dateMatch,
        categoryMatch,
        textMatch,
      },
    };
  }

  private calculateMerchantSimilarity(merchant1: string, merchant2: string): number {
    if (!merchant1 || !merchant2) return 0;
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const m1 = normalize(merchant1);
    const m2 = normalize(merchant2);
    return m1 === m2 ? 1 : this.calculateLevenshteinSimilarity(m1, m2);
  }

  private calculateAmountSimilarity(amount1: number, amount2: number): number {
    const diff = Math.abs(amount1 - amount2);
    const max = Math.max(amount1, amount2);
    return Math.max(0, 1 - diff / max);
  }

  private calculateDateSimilarity(date1: Date, date2: Date): number {
    const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays === 0) return 1;
    if (diffInDays <= 1) return 0.9;
    if (diffInDays <= 3) return 0.7;
    return Math.max(0, 1 - diffInDays / 7);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const matrix = Array(str1.length + 1)
      .fill(null)
      .map(() => Array(str2.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[str1.length][str2.length];
    return 1 - distance / Math.max(str1.length, str2.length);
  }
}
