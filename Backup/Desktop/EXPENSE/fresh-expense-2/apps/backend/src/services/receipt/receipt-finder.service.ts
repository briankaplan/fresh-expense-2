import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from '../../app/receipts/schemas/receipt.schema';
import { R2Service } from '../r2/r2.service';

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
  source?: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL';
  fuzzyMatch?: boolean;
  limit?: number;
  offset?: number;
}

export interface ReceiptMatchResult {
  receipt: ReceiptDocument;
  score: number;
  matchDetails?: {
    merchantMatch?: number;
    amountMatch?: number;
    dateMatch?: number;
    categoryMatch?: number;
    textMatch?: number;
  };
}

@Injectable()
export class ReceiptFinderService {
  private readonly logger = new Logger(ReceiptFinderService.name);

  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
  ) {}

  async findReceipts(options: ReceiptSearchOptions): Promise<ReceiptDocument[]> {
    try {
      const query: any = { userId: new Types.ObjectId(options.userId) };
      
      // Text search
      if (options.query) {
        if (options.fuzzyMatch) {
          // Use regex for fuzzy text search
          const searchRegex = new RegExp(options.query.split('').join('.*'), 'i');
          query.$or = [
            { merchant: searchRegex },
            { 'metadata.text': searchRegex },
            { 'ocrData.text': searchRegex }
          ];
        } else {
          // Use MongoDB text search
          query.$text = { $search: options.query };
        }
      }

      // Merchant search
      if (options.merchant) {
        if (options.fuzzyMatch) {
          query.merchant = new RegExp(options.merchant.split('').join('.*'), 'i');
        } else {
          query.merchant = options.merchant;
        }
      }

      // Amount range
      if (options.minAmount !== undefined || options.maxAmount !== undefined) {
        query.amount = {};
        if (options.minAmount !== undefined) {
          query.amount.$gte = options.minAmount;
        }
        if (options.maxAmount !== undefined) {
          query.amount.$lte = options.maxAmount;
        }
      }

      // Date range
      if (options.startDate || options.endDate) {
        query.date = {};
        if (options.startDate) {
          query.date.$gte = options.startDate;
        }
        if (options.endDate) {
          query.date.$lte = options.endDate;
        }
      }

      // Categories
      if (options.categories?.length) {
        query.category = { $in: options.categories };
      }

      // Tags
      if (options.tags?.length) {
        query.tags = { $all: options.tags };
      }

      // Source
      if (options.source) {
        query.source = options.source;
      }

      const receipts = await this.receiptModel
        .find(query)
        .sort({ date: -1 })
        .skip(options.offset || 0)
        .limit(options.limit || 50)
        .exec();

      // Update signed URLs
      for (const receipt of receipts) {
        const r2Key = receipt.get('r2Key');
        const r2ThumbnailKey = receipt.get('r2ThumbnailKey');
        receipt.set('fullImageUrl', await this.r2Service.getSignedUrl(r2Key));
        receipt.set('thumbnailUrl', await this.r2Service.getSignedUrl(r2ThumbnailKey));
      }

      return receipts;
    } catch (error) {
      this.logger.error('Error finding receipts:', error);
      throw error;
    }
  }

  async findSimilarReceipts(receipt: ReceiptDocument): Promise<ReceiptMatchResult[]> {
    try {
      // Find receipts with similar merchant or amount
      const query = {
        userId: receipt.userId,
        _id: { $ne: receipt._id },
        $or: [
          { merchant: new RegExp(receipt.merchant.split('').join('.*'), 'i') },
          { 
            amount: { 
              $gte: receipt.amount * 0.9, 
              $lte: receipt.amount * 1.1 
            } 
          }
        ]
      };

      const similarReceipts = await this.receiptModel.find(query).exec();
      const results: ReceiptMatchResult[] = [];

      for (const similar of similarReceipts) {
        const matchScore = await this.calculateMatchScore(receipt, similar);
        if (matchScore.score > 0.3) { // Minimum similarity threshold
          results.push(matchScore);
        }
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);

      // Update signed URLs
      for (const result of results) {
        const r2Key = result.receipt.get('r2Key');
        const r2ThumbnailKey = result.receipt.get('r2ThumbnailKey');
        result.receipt.set('fullImageUrl', await this.r2Service.getSignedUrl(r2Key));
        result.receipt.set('thumbnailUrl', await this.r2Service.getSignedUrl(r2ThumbnailKey));
      }

      return results;
    } catch (error) {
      this.logger.error('Error finding similar receipts:', error);
      throw error;
    }
  }

  private async calculateMatchScore(receipt1: ReceiptDocument, receipt2: ReceiptDocument): Promise<ReceiptMatchResult> {
    const merchantMatch = this.calculateMerchantMatchScore(receipt1.merchant, receipt2.merchant);
    const amountMatch = this.calculateAmountMatchScore(receipt1.amount, receipt2.amount);
    const dateMatch = this.calculateDateMatchScore(receipt1.date, receipt2.date);
    const categoryMatch = receipt1.category === receipt2.category ? 1 : 0;

    // Calculate text similarity if OCR data is available
    let textMatch = 0;
    if (receipt1.ocrData?.text && receipt2.ocrData?.text) {
      textMatch = this.calculateTextSimilarity(receipt1.ocrData.text, receipt2.ocrData.text);
    }

    const score = (
      merchantMatch * 0.35 + // 35% weight for merchant
      amountMatch * 0.25 + // 25% weight for amount
      dateMatch * 0.15 + // 15% weight for date
      categoryMatch * 0.15 + // 15% weight for category
      textMatch * 0.10 // 10% weight for text similarity
    );

    return {
      receipt: receipt2,
      score,
      matchDetails: {
        merchantMatch,
        amountMatch,
        dateMatch,
        categoryMatch,
        textMatch
      }
    };
  }

  private calculateMerchantMatchScore(merchant1: string, merchant2: string): number {
    if (!merchant1 || !merchant2) return 0;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const m1 = normalize(merchant1);
    const m2 = normalize(merchant2);

    if (m1 === m2) return 1;
    if (m1.includes(m2) || m2.includes(m1)) return 0.9;

    return this.calculateLevenshteinSimilarity(m1, m2);
  }

  private calculateAmountMatchScore(amount1: number, amount2: number): number {
    if (!amount1 || !amount2) return 0;
    
    const difference = Math.abs(amount1 - amount2);
    const percentage = difference / Math.max(amount1, amount2);

    if (percentage === 0) return 1;
    if (percentage <= 0.01) return 0.9; // 1% difference
    if (percentage <= 0.05) return 0.7; // 5% difference
    if (percentage <= 0.10) return 0.5; // 10% difference
    return 0;
  }

  private calculateDateMatchScore(date1: Date, date2: Date): number {
    const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays === 0) return 1;
    if (diffInDays <= 1) return 0.9;
    if (diffInDays <= 3) return 0.7;
    if (diffInDays <= 7) return 0.5;
    return 0;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const words1 = new Set(normalize(text1).split(/\s+/));
    const words2 = new Set(normalize(text2).split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const matrix = Array(str1.length + 1).fill(null).map(() => 
      Array(str2.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[str1.length][str2.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }
} 