import { Injectable, Logger } from '@nestjs/common';
import { R2Service } from '../../../services/r2/r2.service';

export interface StoredReceipt {
  r2Key: string;
  r2ThumbnailKey: string;
  fullImageUrl: string;
  thumbnailUrl: string;
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
  };
}

@Injectable()
export class ReceiptStorageService {
  private readonly logger = new Logger(ReceiptStorageService.name);

  constructor(private r2Service: R2Service) {}

  async store(
    file: Buffer,
    options: {
      userId: string;
      filename: string;
      mimeType: string;
      thumbnail?: Buffer;
    }
  ): Promise<StoredReceipt> {
    try {
      const r2Key = this.r2Service.generateKey(options.userId, options.filename);
      const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

      // Upload original file
      await this.r2Service.uploadReceipt(file, r2Key, options.mimeType);

      // Upload thumbnail if provided, otherwise generate and upload
      const thumbnail = options.thumbnail || await this.r2Service.generateThumbnail(file);
      await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, 'image/jpeg');

      // Get signed URLs
      const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
      const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

      return {
        r2Key,
        r2ThumbnailKey,
        fullImageUrl,
        thumbnailUrl,
        metadata: {
          mimeType: options.mimeType,
          size: file.length,
          processedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error storing receipt:', error);
      throw error;
    }
  }

  async refreshUrls(receipt: { r2Key: string; r2ThumbnailKey: string }): Promise<{ fullImageUrl: string; thumbnailUrl: string }> {
    const fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
    const thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);
    return { fullImageUrl, thumbnailUrl };
  }

  async delete(receipt: { r2Key: string; r2ThumbnailKey: string }): Promise<void> {
    try {
      await Promise.all([
        this.r2Service.deleteFile(receipt.r2Key),
        this.r2Service.deleteFile(receipt.r2ThumbnailKey),
      ]);
    } catch (error) {
      this.logger.error('Error deleting receipt files:', error);
      throw error;
    }
  }
} 