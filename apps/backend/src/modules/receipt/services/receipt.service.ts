import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReceiptDocument } from '@fresh-expense/types';
import { ReceiptStorageService } from './receipt-storage.service';
import { ReceiptProcessorService } from './receipt-processor.service';
import { ReceiptMatcherService } from './receipt-matcher.service';

export interface CreateReceiptDto {
  file: Buffer;
  filename: string;
  mimeType: string;
  merchant: string;
  amount: number;
  userId: string;
  transactionId?: string;
  category?: string;
  tags?: string[];
  date?: Date;
  source?: string;
}

export interface UpdateReceiptDto {
  merchant?: string;
  amount?: number;
  transactionId?: string;
  category?: string;
  tags?: string[];
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
    private readonly storageService: ReceiptStorageService,
    private readonly processorService: ReceiptProcessorService,
    private readonly matcherService: ReceiptMatcherService
  ) {}

  async create(dto: CreateReceiptDto): Promise<ReceiptDocument> {
    try {
      // Process the receipt file
      const processed = await this.processorService.process(dto.file, dto.mimeType, {
        performOcr: true,
      });

      // Store the processed files
      const stored = await this.storageService.store(processed.imageBuffer, {
        userId: dto.userId,
        filename: dto.filename,
        mimeType: processed.metadata.mimeType,
        thumbnail: processed.thumbnailBuffer,
      });

      // Create the receipt document
      const receipt = new this.receiptModel({
        userId: new Types.ObjectId(dto.userId),
        merchant: dto.merchant,
        amount: dto.amount,
        date: dto.date || new Date(),
        category: dto.category,
        tags: dto.tags,
        source: dto.source || 'MANUAL',
        transactionId: dto.transactionId ? new Types.ObjectId(dto.transactionId) : undefined,
        ...stored,
        metadata: {
          ...stored.metadata,
          ...processed.metadata,
        },
      });

      // Save the receipt
      const savedReceipt = await receipt.save();

      // Find similar receipts
      const similarReceipts = await this.matcherService.findSimilar(savedReceipt);

      // If we found similar receipts with high confidence, we might want to
      // update the receipt with additional information from the matches
      if (similarReceipts.length > 0) {
        const bestMatch = similarReceipts[0];
        if (bestMatch.score > 0.9) {
          // Update with information from the best match
          const updates: UpdateReceiptDto = {};
          if (!savedReceipt.category && bestMatch.receipt.category) {
            updates.category = bestMatch.receipt.category;
          }
          if (!savedReceipt.tags?.length && bestMatch.receipt.tags?.length) {
            updates.tags = bestMatch.receipt.tags;
          }
          if (Object.keys(updates).length > 0) {
            await this.update(savedReceipt._id.toString(), dto.userId, updates);
          }
        }
      }

      return savedReceipt;
    } catch (error) {
      this.logger.error('Error creating receipt:', error);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<ReceiptDocument> {
    try {
      const receipt = await this.receiptModel.findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Refresh signed URLs
      const urls = await this.storageService.refreshUrls(receipt);
      receipt.fullImageUrl = urls.fullImageUrl;
      receipt.thumbnailUrl = urls.thumbnailUrl;

      return receipt;
    } catch (error) {
      this.logger.error('Error finding receipt:', error);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    options: { search?: string; category?: string; startDate?: Date; endDate?: Date } = {}
  ): Promise<ReceiptDocument[]> {
    try {
      return this.matcherService.search({
        userId,
        query: options.search,
        categories: options.category ? [options.category] : undefined,
        startDate: options.startDate,
        endDate: options.endDate,
        fuzzyMatch: true,
      });
    } catch (error) {
      this.logger.error('Error finding receipts:', error);
      throw error;
    }
  }

  async update(id: string, userId: string, dto: UpdateReceiptDto): Promise<ReceiptDocument> {
    try {
      const receipt = await this.receiptModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            ...(dto.merchant && { merchant: dto.merchant }),
            ...(dto.amount && { amount: dto.amount }),
            ...(dto.category && { category: dto.category }),
            ...(dto.tags && { tags: dto.tags }),
            ...(dto.transactionId && {
              transactionId: new Types.ObjectId(dto.transactionId),
            }),
          },
        },
        { new: true }
      );

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Refresh signed URLs
      const urls = await this.storageService.refreshUrls(receipt);
      receipt.fullImageUrl = urls.fullImageUrl;
      receipt.thumbnailUrl = urls.thumbnailUrl;

      return receipt;
    } catch (error) {
      this.logger.error('Error updating receipt:', error);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const receipt = await this.receiptModel.findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Delete files from storage
      await this.storageService.delete(receipt);

      // Delete from database
      await receipt.deleteOne();
    } catch (error) {
      this.logger.error('Error deleting receipt:', error);
      throw error;
    }
  }
}
