import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Receipt, ReceiptDocument } from '../receipts/schemas/receipt.schema';
import { OCRService } from '../../services/ocr/ocr.service';
import { R2Service } from '../../services/r2/r2.service';
import { GooglePhotosService } from '../../services/google-photos/google-photos.service';
import { ReceiptConverterService } from '../services/receipt/receipt-converter.service';

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

@Injectable()
export class UnifiedReceiptProcessorService {
  private readonly logger = new Logger(UnifiedReceiptProcessorService.name);

  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    private readonly ocrService: OCRService,
    private readonly r2Service: R2Service,
    private readonly googlePhotosService: GooglePhotosService,
    private readonly receiptConverter: ReceiptConverterService,
  ) {}

  async processReceipt(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    try {
      this.logger.log(`Processing receipt from source: ${options.source}`);

      let receipt: ReceiptDocument;

      switch (options.source) {
        case 'MANUAL':
          receipt = await this.processManualUpload(options);
          break;
        case 'GOOGLE_PHOTOS':
          receipt = await this.processGooglePhotos(options);
          break;
        case 'EMAIL':
          receipt = await this.processEmailReceipt(options);
          break;
        case 'CSV':
          receipt = await this.processCSVReceipt(options);
          break;
        case 'UPLOAD':
          if (!options.file) {
            throw new Error('File is required for upload processing');
          }
          receipt = await this.createInitialReceipt({
            userId: new MongooseSchema.Types.ObjectId(options.userId),
            originalFilename: options.file.filename,
            source: 'UPLOAD',
            metadata: {
              r2Keys: {},
              processingStatus: 'PROCESSING',
              version: 1,
              importDate: new Date(),
              source: 'UPLOAD',
              lastProcessed: new Date()
            }
          });
          break;
        default:
          throw new Error(`Unsupported receipt source: ${options.source}`);
      }

      // Perform OCR if we have a file
      if (options.file) {
        const ocrResult = await this.ocrService.processImage(options.file.buffer);
        const extractedData = await this.ocrService.extractReceiptData(
          Array.isArray(ocrResult.text) ? ocrResult.text.join('\n') : ocrResult.text
        );

        // Update receipt with OCR data
        receipt = await this.receiptModel.findByIdAndUpdate(
          receipt._id,
          {
            $set: {
              ocrData: {
                text: Array.isArray(ocrResult.text) ? ocrResult.text.join('\n') : ocrResult.text,
                confidence: ocrResult.confidence,
                metadata: extractedData,
                processedAt: new Date(),
              },
            },
          },
          { new: true }
        );
      }

      // If we have expense data, try to match it
      if (options.expenseData) {
        const matchScore = await this.calculateMatchScore(receipt, options.expenseData);
        if (matchScore.confidence > 0.7) {
          receipt = await this.receiptModel.findByIdAndUpdate(
            receipt._id,
            {
              $set: {
                expenseId: new MongooseSchema.Types.ObjectId(options.expenseData.transactionId),
                matchScore: matchScore.confidence,
                matchDetails: matchScore.matchDetails,
              },
            },
            { new: true }
          );
        }
      }

      return receipt;
    } catch (error) {
      this.logger.error('Error processing receipt:', error);
      throw error;
    }
  }

  private async processManualUpload(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.file) {
      throw new Error('File is required for manual upload');
    }

    const r2Key = this.r2Service.generateKey(options.userId, options.file.filename);
    const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

    // Upload original file
    await this.r2Service.uploadReceipt(options.file.buffer, r2Key, options.file.mimeType);

    // Generate and upload thumbnail
    const thumbnail = await this.r2Service.generateThumbnail(options.file.buffer);
    await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

    // Get signed URLs
    const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
    const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

    const receiptData: Partial<Receipt> = {
      originalFilename: options.file.filename,
      urls: {
        original: fullImageUrl,
        thumbnail: thumbnailUrl
      },
      merchant: options.expenseData?.merchant,
      amount: options.expenseData?.amount,
      userId: new MongooseSchema.Types.ObjectId(options.userId),
      source: options.source,
      mimeType: options.file.mimeType,
      fileSize: options.file.buffer.length,
      metadata: {
        r2Keys: {
          original: r2Key,
          thumbnail: r2ThumbnailKey
        },
        processingStatus: 'completed',
        version: 1,
        importDate: new Date(),
        source: options.source,
        lastProcessed: new Date()
      }
    };

    const receipt = await this.receiptModel.create(receiptData);
    const populatedReceipt = await receipt.populate('userId');
    return populatedReceipt;
  }

  private async processGooglePhotos(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.expenseData) {
      throw new Error('Expense data is required for Google Photos processing');
    }

    const matchedReceipts = await this.googlePhotosService.findReceiptsByExpense({
      merchant: options.expenseData.merchant,
      amount: options.expenseData.amount,
      date: options.expenseData.date,
      userId: options.userId,
    });

    if (matchedReceipts.length === 0) {
      throw new Error('No matching receipts found in Google Photos');
    }

    // Return the best match
    return matchedReceipts[0];
  }

  private async processEmailReceipt(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.file) {
      throw new Error('File is required for email receipt processing');
    }

    // For HTML content, convert to PDF first
    if (options.file.mimeType === 'text/html') {
      const pdfBuffer = await this.receiptConverter.htmlToPdf(
        options.file.buffer.toString(),
        { width: 800, height: 1200 }
      );
      
      options = {
        ...options,
        file: {
          ...options.file,
          buffer: pdfBuffer,
          mimeType: 'application/pdf'
        }
      };
    }

    // For PDF files, generate a preview image
    if (options.file.mimeType === 'application/pdf') {
      const { buffer: imageBuffer } = await this.receiptConverter.pdfToImage(
        options.file.buffer,
        { width: 800, quality: 300 }
      );
      
      // Store both PDF and image
      const r2Key = this.r2Service.generateKey(options.userId, options.file.filename);
      const r2ImageKey = this.r2Service.generateKey(options.userId, options.file.filename.replace('.pdf', '.png'));
      const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2ImageKey);

      await Promise.all([
        this.r2Service.uploadReceipt(options.file.buffer, r2Key, options.file.mimeType),
        this.r2Service.uploadReceipt(imageBuffer, r2ImageKey, 'image/png')
      ]);

      // Generate and upload thumbnail
      const thumbnail = await this.r2Service.generateThumbnail(imageBuffer);
      await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

      // Get signed URLs
      const [pdfUrl, imageUrl, thumbnailUrl] = await Promise.all([
        this.r2Service.getSignedUrl(r2Key),
        this.r2Service.getSignedUrl(r2ImageKey),
        this.r2Service.getSignedUrl(r2ThumbnailKey)
      ]);

      const receiptData: Partial<Receipt> = {
        originalFilename: options.file.filename,
        urls: {
          original: imageUrl,
          thumbnail: thumbnailUrl,
          converted: pdfUrl
        },
        merchant: options.expenseData?.merchant || 'Unknown',
        amount: options.expenseData?.amount || 0,
        date: options.expenseData?.date || new Date(),
        category: options.expenseData?.category || 'Uncategorized',
        userId: new MongooseSchema.Types.ObjectId(options.userId),
        source: options.source,
        mimeType: options.file.mimeType,
        fileSize: options.file.buffer.length,
        metadata: {
          r2Keys: {
            original: r2Key,
            converted: r2ImageKey,
            thumbnail: r2ThumbnailKey
          },
          processingStatus: 'completed',
          version: 1,
          importDate: new Date(),
          source: options.source,
          lastProcessed: new Date()
        }
      };

      const receipt = await this.receiptModel.create(receiptData);
      return receipt;
    }

    // For other types, process as usual
    return this.processManualUpload(options);
  }

  private async processCSVReceipt(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    if (!options.expenseData) {
      throw new Error('Expense data is required for CSV receipt processing');
    }

    // Create a basic receipt record for CSV imports
    const csvReceipt = new this.receiptModel({
      merchant: options.expenseData.merchant,
      amount: options.expenseData.amount,
      userId: new MongooseSchema.Types.ObjectId(options.userId),
      source: 'CSV',
      metadata: {
        r2Keys: {},
        importDate: new Date(),
        source: 'csv_import',
        processingStatus: 'completed',
        version: 1
      }
    });

    return csvReceipt.save();
  }

  private async calculateMatchScore(receipt: ReceiptDocument, expenseData: {
    merchant: string;
    amount: number;
    date: Date;
  }): Promise<ReceiptMatch> {
    const merchantMatch = this.calculateMerchantMatchScore(
      receipt.merchant,
      expenseData.merchant
    );

    const amountMatch = this.calculateAmountMatchScore(
      receipt.amount,
      expenseData.amount
    );

    const dateMatch = this.calculateDateMatchScore(
      receipt.date || new Date(),
      expenseData.date
    );

    const confidence = (
      merchantMatch * 0.4 + // 40% weight for merchant
      amountMatch * 0.4 + // 40% weight for amount
      dateMatch * 0.2 // 20% weight for date
    );

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

  private levenshteinDistance(str1: string, str2: string): number {
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
        r2Keys: data.metadata?.r2Keys || {}
      }
    });

    return receipt.save();
  }
} 