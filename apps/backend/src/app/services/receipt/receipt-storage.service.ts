import { Injectable, Logger } from '@nestjs/common';
import { R2Service } from '@fresh-expense/utils';

@Injectable()
export class ReceiptStorageService {
  private readonly logger = new Logger(ReceiptStorageService.name);
  private readonly bucket = 'receipts';

  constructor(private readonly r2Service: R2Service) {}

  async uploadFile(userId: string, file: Buffer, filename: string): Promise<string> {
    try {
      const key = `${userId}/${filename}`;
      await this.r2Service.uploadFile(this.bucket, key, file);
      return key;
    } catch (error) {
      this.logger.error('Error uploading receipt file:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.r2Service.deleteFile(this.bucket, key);
    } catch (error) {
      this.logger.error('Error deleting receipt file:', error);
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      return await this.r2Service.getFileUrl(this.bucket, key);
    } catch (error) {
      this.logger.error('Error getting receipt file URL:', error);
      throw error;
    }
  }

  async generateThumbnail(file: Buffer): Promise<Buffer> {
    // TODO: Implement thumbnail generation
    // 1. Use sharp or similar library to resize image
    // 2. Convert to webp format
    // 3. Return thumbnail buffer
    return file;
  }
}
