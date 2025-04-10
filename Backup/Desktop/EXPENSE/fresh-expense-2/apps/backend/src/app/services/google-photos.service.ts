import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OCRService } from '../services/ocr/ocr.service';
import { R2Service } from '../services/r2/r2.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt } from '../receipts/schemas/receipt.schema';

interface SearchFilters {
  dateFilter?: {
    startDate?: Date;
    endDate?: Date;
  };
  contentFilter?: {
    includedContentCategories?: string[];
  };
  mediaTypeFilter?: {
    mediaTypes?: string[];
  };
}

@Injectable()
export class GooglePhotosService {
  private readonly logger = new Logger(GooglePhotosService.name);
  private photos: any;
  private initialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly ocrService: OCRService,
    private readonly r2Service: R2Service,
    @InjectModel(Receipt.name) private receiptModel: Model<Receipt>
  ) {
    this.initializeService().catch(err => 
      this.logger.error('Failed to initialize Google Photos service', err)
    );
  }

  private async initializeService() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: this.configService.get('google.credentials'),
        scopes: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
      });

      this.photos = google.photoslibrary({ version: 'v1', auth });
      this.initialized = true;
      this.logger.log('Google Photos service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Photos service', error);
      throw error;
    }
  }

  async searchPhotos(filters: SearchFilters = {}) {
    try {
      if (!this.initialized) {
        await this.initializeService();
      }

      const searchParams = {
        pageSize: 25,
        filters: {
          contentFilter: {
            includedContentCategories: ['RECEIPTS'],
            ...filters.contentFilter,
          },
          mediaTypeFilter: {
            mediaTypes: ['PHOTO'],
            ...filters.mediaTypeFilter,
          },
          ...(filters.dateFilter && {
            dateFilter: {
              ranges: [{
                startDate: this.formatDateForApi(filters.dateFilter.startDate),
                endDate: this.formatDateForApi(filters.dateFilter.endDate),
              }],
            },
          }),
        },
      };

      const response = await this.photos.mediaItems.search({
        requestBody: searchParams,
      });

      return response.data.mediaItems || [];
    } catch (error) {
      this.logger.error('Error searching photos:', error);
      throw error;
    }
  }

  async findReceiptsByExpense(expenseData: {
    merchant: string;
    amount: number;
    date: Date;
    userId: string;
  }) {
    try {
      // Search for photos within a date range (7 days before to 3 days after)
      const startDate = new Date(expenseData.date);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(expenseData.date);
      endDate.setDate(endDate.getDate() + 3);

      const photos = await this.searchPhotos({
        dateFilter: {
          startDate,
          endDate,
        },
      });

      if (!photos.length) {
        return [];
      }

      const matchedReceipts = [];

      for (const photo of photos) {
        try {
          // Download the photo
          const photoBuffer = await this.downloadPhoto(photo.baseUrl);
          
          // Process with OCR
          const ocrResult = await this.ocrService.processImage(photoBuffer);
          
          // Calculate match score
          const matchScore = this.calculateMatchScore({
            text: ocrResult.text.join(' '),
            merchant: expenseData.merchant,
            amount: expenseData.amount,
            date: expenseData.date,
          });

          if (matchScore > 0.7) { // Good match threshold
            // Store in R2
            const r2Key = this.r2Service.generateKey(expenseData.userId, photo.filename);
            const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

            await this.r2Service.uploadReceipt(photoBuffer, r2Key, 'image/jpeg');
            
            // Generate and upload thumbnail
            const thumbnail = await this.r2Service.generateThumbnail(photoBuffer);
            await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

            // Get signed URLs
            const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
            const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

            // Create receipt record
            const receipt = await this.receiptModel.create({
              filename: photo.filename,
              thumbnailUrl,
              fullImageUrl,
              merchant: expenseData.merchant,
              amount: expenseData.amount,
              userId: expenseData.userId,
              r2Key,
              r2ThumbnailKey,
              source: 'GOOGLE_PHOTOS',
              ocrData: {
                text: ocrResult.text,
                confidence: ocrResult.confidence,
                metadata: ocrResult.metadata,
                processedAt: new Date(),
              },
              metadata: {
                mimeType: 'image/jpeg',
                size: photoBuffer.length,
                googlePhotosId: photo.id,
                matchScore,
              },
            });

            matchedReceipts.push(receipt);
          }
        } catch (photoError) {
          this.logger.warn(`Error processing photo ${photo.id}:`, photoError);
          continue;
        }
      }

      return matchedReceipts;
    } catch (error) {
      this.logger.error('Error finding receipts:', error);
      throw error;
    }
  }

  private async downloadPhoto(baseUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(`${baseUrl}=d`);
      if (!response.ok) {
        throw new Error(`Failed to download photo: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      this.logger.error('Error downloading photo:', error);
      throw error;
    }
  }

  private calculateMatchScore({
    text,
    merchant,
    amount,
    date,
  }: {
    text: string;
    merchant: string;
    amount: number;
    date: Date;
  }): number {
    let score = 0;
    const normalizedText = text.toLowerCase();
    const normalizedMerchant = merchant.toLowerCase();

    // Merchant name match (40%)
    if (this.fuzzyMatchMerchant(normalizedText, normalizedMerchant)) {
      score += 0.4;
    }

    // Amount match (40%)
    if (this.fuzzyMatchAmount(normalizedText, amount)) {
      score += 0.4;
    }

    // Date match (20%)
    if (this.fuzzyMatchDate(normalizedText, date)) {
      score += 0.2;
    }

    return score;
  }

  private fuzzyMatchMerchant(text: string, merchant: string): boolean {
    // Handle short merchant names (like "CVS") with exact match
    if (merchant.length <= 3) {
      return new RegExp(`\\b${merchant}\\b`, 'i').test(text);
    }

    // Split merchant into words and filter out short/common words
    const merchantWords = merchant
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'or', 'in', 'at', 'of', 'to'].includes(word));

    if (merchantWords.length === 0) return false;

    // Count matching words
    const matchCount = merchantWords.filter(word => text.includes(word)).length;
    return matchCount / merchantWords.length >= 0.5; // At least 50% of words must match
  }

  private fuzzyMatchAmount(text: string, amount: number): boolean {
    const amountStr = amount.toFixed(2);
    const patterns = [
      new RegExp(`\\$${amountStr}\\b`),
      new RegExp(`\\$\\s*${amountStr}\\b`),
      new RegExp(`total\\s*[:=]?\\s*\\$?\\s*${amountStr}\\b`, 'i'),
      new RegExp(`amount\\s*[:=]?\\s*\\$?\\s*${amountStr}\\b`, 'i'),
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  private fuzzyMatchDate(text: string, date: Date): boolean {
    const datePatterns = [
      date.toLocaleDateString(),
      `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
      `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`,
      `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`,
    ];

    return datePatterns.some(pattern => text.includes(pattern));
  }

  private formatDateForApi(date?: Date) {
    if (!date) return undefined;
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
} 