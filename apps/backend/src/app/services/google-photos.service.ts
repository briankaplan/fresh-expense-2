import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OCRService } from '../../services/ocr/ocr.service';
import { R2Service } from '../../services/r2/r2.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt } from '../receipts/schemas/receipt.schema';
import { TokenManagerService } from './token-manager.service';
import { RateLimiter } from 'limiter';
import { retry } from 'ts-retry-promise';
import { GoogleService } from './google.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GaxiosResponse } from 'gaxios';

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

interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
}

interface OCRResult {
  text: string;
  confidence: number;
  blocks: {
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }[];
}

interface MediaItemsResponse {
  mediaItems?: Array<{
    id: string;
    baseUrl: string;
    filename?: string;
  }>;
}

@Injectable()
export class GooglePhotosService extends GoogleService {
  protected readonly logger = new Logger(GooglePhotosService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly tokenManager: TokenManagerService,
    protected readonly eventEmitter: EventEmitter2,
    private readonly ocrService: OCRService,
    private readonly r2Service: R2Service,
    @InjectModel(Receipt.name) private receiptModel: Model<Receipt>
  ) {
    super(configService, tokenManager, eventEmitter);
  }

  private async withRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return retry(fn, {
      retries: this.MAX_RETRIES,
      delay: this.RETRY_DELAY,
      backoff: 'LINEAR',
    });
  }

  override async searchPhotos(startDate: Date, endDate: Date): Promise<GooglePhoto[]> {
    const filters: SearchFilters = {
      dateFilter: {
        startDate,
        endDate,
      },
    };
    return this.searchPhotosWithFilters(filters);
  }

  private async searchPhotosWithFilters(filters: SearchFilters = {}): Promise<GooglePhoto[]> {
    const results: GooglePhoto[] = [];
    const accounts = Array.from(this.accounts.keys());

    for (const email of accounts) {
      try {
        const photos = await this.withAuth(email, async oauth2Client => {
          const photos = google.photoslibrary({ version: 'v1', auth: oauth2Client });
          const response = (await this.withRateLimit(() =>
            photos.mediaItems.search({
              requestBody: {
                filters: {
                  dateFilter: filters.dateFilter
                    ? {
                        ranges: [
                          {
                            startDate: {
                              year: filters.dateFilter.startDate?.getFullYear(),
                              month: filters.dateFilter.startDate?.getMonth()! + 1,
                              day: filters.dateFilter.startDate?.getDate(),
                            },
                            endDate: {
                              year: filters.dateFilter.endDate?.getFullYear(),
                              month: filters.dateFilter.endDate?.getMonth()! + 1,
                              day: filters.dateFilter.endDate?.getDate(),
                            },
                          },
                        ],
                      }
                    : undefined,
                  contentFilter: filters.contentFilter,
                  mediaTypeFilter: filters.mediaTypeFilter,
                },
              },
            })
          )) as GaxiosResponse<MediaItemsResponse>;

          return response.data.mediaItems || [];
        });

        results.push(
          ...photos.map(photo => ({
            id: photo.id,
            baseUrl: photo.baseUrl,
            filename: photo.filename || `photo-${photo.id}.jpg`,
          }))
        );
      } catch (error) {
        this.logger.error(`Error searching photos for ${email}:`, error);
      }
    }

    return results;
  }

  async findReceiptsByExpense(expenseData: {
    merchant: string;
    amount: number;
    date: Date;
    userId: string;
  }): Promise<GooglePhoto[]> {
    const { merchant, amount, date, userId } = expenseData;
    const results: GooglePhoto[] = [];
    const accounts = Array.from(this.accounts.keys());

    for (const email of accounts) {
      try {
        const photos = await this.withAuth(email, async oauth2Client => {
          const photos = google.photoslibrary({ version: 'v1', auth: oauth2Client });
          const response = (await this.withRateLimit(() =>
            photos.mediaItems.search({
              requestBody: {
                filters: {
                  dateFilter: {
                    ranges: [
                      {
                        startDate: {
                          year: date.getFullYear(),
                          month: date.getMonth() + 1,
                          day: date.getDate(),
                        },
                        endDate: {
                          year: date.getFullYear(),
                          month: date.getMonth() + 1,
                          day: date.getDate(),
                        },
                      },
                    ],
                  },
                },
              },
            })
          )) as GaxiosResponse<MediaItemsResponse>;

          return response.data.mediaItems || [];
        });

        for (const photo of photos) {
          try {
            const imageBuffer = await this.downloadPhoto(photo.baseUrl);
            const ocrResult = await this.ocrService.processReceipt(imageBuffer);
            const matchScore = this.calculateMatchScore({
              text: ocrResult.text,
              merchant,
              amount,
              date,
            });

            if (matchScore > 0.7) {
              // 70% match threshold
              results.push({
                id: photo.id,
                baseUrl: photo.baseUrl,
                filename: photo.filename || `receipt-${photo.id}.jpg`,
              });
            }
          } catch (error) {
            this.logger.error(`Error processing photo ${photo.id}:`, error);
          }
        }
      } catch (error) {
        this.logger.error(`Error searching photos for ${email}:`, error);
      }
    }

    return results;
  }

  private async downloadPhoto(baseUrl: string): Promise<Buffer> {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to download photo: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
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
    const merchantMatch = text.toLowerCase().includes(merchant.toLowerCase());
    const amountMatch = text.includes(amount.toFixed(2));
    const dateMatch = text.includes(date.toLocaleDateString());

    if (merchantMatch) score += 0.4;
    if (amountMatch) score += 0.4;
    if (dateMatch) score += 0.2;

    return score;
  }
}
