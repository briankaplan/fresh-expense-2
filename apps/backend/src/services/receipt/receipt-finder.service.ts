import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from '../../app/receipts/schemas/receipt.schema';
import { R2Service } from '../r2/r2.service';
import { calculateReceiptMatchScore, MatchScoreDetails, updateSignedUrls } from '@expense/utils';

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
  matchDetails: MatchScoreDetails;
}

@Injectable()
export class ReceiptFinderService {
  private readonly logger = new Logger(ReceiptFinderService.name);

  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service
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
            { 'ocrData.text': searchRegex },
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
              $lte: receipt.amount * 1.1,
            },
          },
        ],
      };

      const similarReceipts = await this.receiptModel.find(query).exec();
      const results: ReceiptMatchResult[] = [];

      for (const similar of similarReceipts) {
        const matchScore = this.calculateMatchScore(receipt, similar);
        if (matchScore.score > 0.3) {
          // Minimum similarity threshold
          results.push(matchScore);
        }
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);

      // Update signed URLs
      await this.updateSignedUrls(results);

      return results;
    } catch (error) {
      this.logger.error('Error finding similar receipts:', error);
      throw error;
    }
  }

  private calculateMatchScore(
    receipt1: ReceiptDocument,
    receipt2: ReceiptDocument
  ): ReceiptMatchResult {
    const details = calculateReceiptMatchScore(receipt1, receipt2);

    return {
      receipt: receipt2,
      score: details.totalScore,
      matchDetails: {
        merchantMatch: details.merchantMatch,
        amountMatch: details.amountMatch,
        dateMatch: details.dateMatch,
        categoryMatch: details.categoryMatch,
        textMatch: details.textMatch,
      },
    };
  }

  private async updateSignedUrls(results: ReceiptMatchResult[]): Promise<void> {
    await updateSignedUrls(
      results.map(r => r.receipt),
      this.r2Service
    );
  }
}
