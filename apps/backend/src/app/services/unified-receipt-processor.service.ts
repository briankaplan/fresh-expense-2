import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { ReceiptDocument } from '@fresh-expense/types';
import { OCRService } from '../../services/ocr/ocr.service';
import { R2Service } from '../../services/r2/r2.service';
import { GooglePhotosService } from '../services/google-photos.service';
import { ReceiptConverterService } from './receipt/receipt-converter.service';
import { RateLimiter } from 'limiter';
import { retry } from 'ts-retry-promise';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface ProcessReceiptOptions {
  source: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL' | 'UPLOAD';
  expenseData?: {
    merchant: string;
    amount: number;
    date: Date;
    transactionId?: string;
    category?: string;
  };
  file?: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  };
  userId: string;
}

interface ReceiptMatch {
  confidence: number;
  receipt: ReceiptDocument;
  matchDetails: {
    merchantMatch: number;
    amountMatch: number;
    dateMatch: number;
  };
}

interface ProcessingProgress {
  source: string;
  status: 'initializing' | 'processing' | 'completed' | 'error';
  progress: number;
  total: number;
  error?: string;
}

@Injectable()
export class UnifiedReceiptProcessorService {
  private readonly logger = new Logger(UnifiedReceiptProcessorService.name);
  private readonly rateLimiter: RateLimiter;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly progressMap = new Map<string, ProcessingProgress>();

  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
    private readonly ocrService: OCRService,
    private readonly r2Service: R2Service,
    private readonly googlePhotosService: GooglePhotosService,
    private readonly receiptConverter: ReceiptConverterService,
    private readonly eventEmitter: EventEmitter2
  ) {
    // Allow 50 requests per minute
    this.rateLimiter = new RateLimiter({ tokensPerInterval: 50, interval: 'minute' });
  }

  private async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.removeTokens(1);
    return fn();
  }

  private async withRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return retry(
      async () => {
        try {
          return await fn();
        } catch (error) {
          this.logger.warn(`Retrying ${context} due to error:`, error);
          throw error;
        }
      },
      {
        retries: this.MAX_RETRIES,
        delay: this.RETRY_DELAY,
        backoff: 'LINEAR',
      }
    );
  }

  private updateProgress(source: string, progress: Partial<ProcessingProgress>) {
    const current = this.progressMap.get(source) || {
      source,
      status: 'matched',
      progress: 0,
      total: 1,
    };

    const updated = { ...current, ...progress };
    this.progressMap.set(source, updated);

    this.eventEmitter.emit('receipt.processing.progress', updated);
  }

  async processReceipt(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    try {
      this.updateProgress(options.source, { status: 'matched' });

      let receipt: ReceiptDocument;

      switch (options.source) {
        case 'GOOGLE_PHOTOS':
          receipt = await this.processGooglePhotos(options);
          break;
        case 'EMAIL':
          receipt = await this.processEmail(options);
          break;
        case 'UPLOAD':
          receipt = await this.processUpload(options);
          break;
        case 'CSV':
          receipt = await this.processCSV(options);
          break;
        case 'MANUAL':
          receipt = await this.processManual(options);
          break;
        default:
          throw new Error(`Unsupported source: ${options.source}`);
      }

      this.updateProgress(options.source, {
        status: 'matched',
        progress: 1,
        total: 1,
      });

      return receipt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateProgress(options.source, {
        status: 'matched',
        error: errorMessage,
      });
      throw error;
    }
  }

  private async processGooglePhotos(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.expenseData) {
      throw new Error('Expense data is required for Google Photos processing');
    }

    return await this.withRetry(async () => {
      const matchedReceipts = await this.googlePhotosService.findReceiptsByExpense({
        merchant: options.expenseData!.merchant,
        amount: options.expenseData!.amount,
        date: options.expenseData!.date,
        userId: options.userId,
      });

      if (matchedReceipts.length != null) {
        throw new Error('No matching receipts found in Google Photos');
      }

      // Return the best match
      return matchedReceipts[0];
    }, 'Google Photos processing');
  }

  private async processEmail(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.file) {
      throw new Error('File data is required for email processing');
    }

    return await this.withRetry(async () => {
      // Process the email attachment
      const processedData = await this.receiptConverter.processEmailAttachment(
        options.file!.buffer,
        options.file!.filename
      );

      // Store in R2
      const r2Key = this.r2Service.generateKey(options.userId, options.file!.filename);
      const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

      await this.r2Service.uploadReceipt(options.file!.buffer, r2Key, options.file!.mimeType);

      // Generate and upload thumbnail
      const thumbnail = await this.r2Service.generateThumbnail(options.file!.buffer);
      await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

      // Get signed URLs
      const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
      const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

      // Create receipt record
      return await this.receiptModel.create({
        filename: options.file!.filename,
        thumbnailUrl,
        fullImageUrl,
        merchant: options.expenseData?.merchant,
        amount: options.expenseData?.amount,
        userId: options.userId,
        r2Key,
        r2ThumbnailKey,
        source: 'EMAIL',
        metadata: {
          mimeType: options.file!.mimeType,
          size: options.file!.buffer.length,
        },
        ...processedData,
      });
    }, 'Email processing');
  }

  private async processUpload(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.file) {
      throw new Error('File data is required for upload processing');
    }

    return await this.withRetry(async () => {
      // Process the uploaded file
      const processedData = await this.receiptConverter.processUploadedFile(
        options.file!.buffer,
        options.file!.filename
      );

      // Store in R2
      const r2Key = this.r2Service.generateKey(options.userId, options.file!.filename);
      const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

      await this.r2Service.uploadReceipt(options.file!.buffer, r2Key, options.file!.mimeType);

      // Generate and upload thumbnail
      const thumbnail = await this.r2Service.generateThumbnail(options.file!.buffer);
      await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

      // Get signed URLs
      const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
      const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

      // Create receipt record
      return await this.receiptModel.create({
        filename: options.file!.filename,
        thumbnailUrl,
        fullImageUrl,
        merchant: options.expenseData?.merchant,
        amount: options.expenseData?.amount,
        userId: options.userId,
        r2Key,
        r2ThumbnailKey,
        source: 'UPLOAD',
        metadata: {
          mimeType: options.file!.mimeType,
          size: options.file!.buffer.length,
        },
        ...processedData,
      });
    }, 'Upload processing');
  }

  private async processCSV(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.file) {
      throw new Error('File data is required for CSV processing');
    }

    return await this.withRetry(async () => {
      // Process the CSV file
      const processedData = await this.receiptConverter.processCSVFile(
        options.file!.buffer,
        options.file!.filename
      );

      // Create receipt record
      return await this.receiptModel.create({
        filename: options.file!.filename,
        merchant: options.expenseData?.merchant,
        amount: options.expenseData?.amount,
        userId: options.userId,
        source: 'CSV',
        metadata: {
          mimeType: options.file!.mimeType,
          size: options.file!.buffer.length,
        },
        ...processedData,
      });
    }, 'CSV processing');
  }

  private async processManual(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.expenseData) {
      throw new Error('Expense data is required for manual processing');
    }

    return await this.withRetry(async () => {
      // Create receipt record
      return await this.receiptModel.create({
        merchant: options.expenseData!.merchant,
        amount: options.expenseData!.amount,
        date: options.expenseData!.date,
        userId: options.userId,
        source: 'MANUAL',
        metadata: {
          processedAt: new Date(),
        },
      });
    }, 'Manual processing');
  }

  private async calculateMatchScore(
    receipt: ReceiptDocument,
    expenseData: {
      merchant: string;
      amount: number;
      date: Date;
    }
  ): Promise<ReceiptMatch> {
    const merchantMatch = this.calculateMerchantMatchScore(receipt.merchant, expenseData.merchant);

    const amountMatch = this.calculateAmountMatchScore(receipt.amount, expenseData.amount);

    const dateMatch = this.calculateDateMatchScore(receipt.date || new Date(), expenseData.date);

    const confidence =
      merchantMatch * 0.4 + // 40% weight for merchant
      amountMatch * 0.4 + // 40% weight for amount
      dateMatch * 0.2; // 20% weight for date

    return {
      confidence,
      receipt,
      matchDetails: {
        merchantMatch,
        amountMatch,
        dateMatch,
      },
    };
  }

  private calculateMerchantMatchScore(merchant1: string, merchant2: string): number {
    if (!merchant1 || !merchant2) return 0;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const m1 = normalize(merchant1);
    const m2 = normalize(merchant2);

    if (m1 === m2) return 1;
    if (m1.includes(m2) || m2.includes(m1)) return 0.9;

    // Calculate Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(m1, m2);
    const maxLength = Math.max(m1.length, m2.length);
    return Math.max(0, 1 - distance / maxLength);
  }

  private calculateAmountMatchScore(amount1: number, amount2: number): number {
    if (!amount1 || !amount2) return 0;

    const difference = Math.abs(amount1 - amount2);
    const percentage = difference / amount2;

    if (percentage === 0) return 1;
    if (percentage <= 0.01) return 0.9; // 1% difference
    if (percentage <= 0.05) return 0.7; // 5% difference
    if (percentage <= 0.1) return 0.5; // 10% difference
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

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str1.length + 1)
      .fill(null)
      .map(() => Array(str2.length + 1).fill(null));

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

    return matrix[str1.length][str2.length];
  }

  private async createInitialReceipt(data: Partial<Receipt>): Promise<ReceiptDocument> {
    const receipt = new this.receiptModel({
      ...data,
      metadata: {
        ...data.metadata,
        processingStatus: 'PENDING',
        version: 1,
        importDate: new Date(),
        r2Keys: data.metadata?.r2Keys || {},
      },
    });

    return receipt.save();
  }
}
