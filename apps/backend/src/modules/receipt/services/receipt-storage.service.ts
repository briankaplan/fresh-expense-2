import { Injectable, Logger } from '@nestjs/common';
import { R2Service } from '../../../services/r2/r2.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReceiptStorageService {
  private readonly logger = new Logger(ReceiptStorageService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly configService: ConfigService,
  ) {}

  async storeReceipt(file: Buffer, userId: string): Promise<{
    url: string;
    thumbnailUrl: string;
    processedData: {
      text: string;
      confidence: number;
      category: string;
    };
  }> {
    try {
      const filename = `${Date.now()}.jpg`;
      
      // Upload file with thumbnail
      const uploadResult = await this.r2Service.uploadFile(file, {
        userId,
        filename,
        mimeType: 'image/jpeg',
        generateThumbnail: true,
      });
      
      if (!uploadResult.thumbnailUrl) {
        throw new Error('Failed to generate thumbnail');
      }
      
      // Process with HuggingFace
      const processedData = await this.r2Service.processReceiptWithHuggingFace(file);

      return {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        processedData,
      };
    } catch (error) {
      this.logger.error('Error storing receipt:', error);
      throw error;
    }
  }

  async getReceiptUrl(key: string): Promise<string> {
    return this.r2Service.getSignedUrl(key);
  }

  async deleteReceipt(key: string): Promise<void> {
    try {
      await this.r2Service.deleteFile(key);
      // Also delete thumbnail if it exists
      const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb$&');
      await this.r2Service.deleteFile(thumbnailKey).catch(() => {
        // Ignore error if thumbnail doesn't exist
      });
    } catch (error) {
      this.logger.error('Error deleting receipt:', error);
      throw error;
    }
  }
} 