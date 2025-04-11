import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

interface FetchResponse extends Response {
  buffer(): Promise<Buffer>;
}

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private fetch: typeof fetch;

  constructor(configService: ConfigService) {
    const accessKeyId = configService.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = configService.get('R2_SECRET_ACCESS_KEY');
    const endpoint = configService.get('R2_ENDPOINT');
    const bucket = configService.get('R2_BUCKET');

    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      throw new Error('Missing required R2 configuration');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucket = bucket;
    this.fetch = require('node-fetch');
  }

  async storeReceipt(receiptUrl: string, expenseId: string) {
    try {
      const response = await this.fetch(receiptUrl) as FetchResponse;
      const buffer = await response.buffer();
      const fileExtension = path.extname(receiptUrl);
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      const originalKey = `original/${expenseId}${fileExtension}`;
      await this.uploadToR2(buffer, originalKey, contentType);
      
      const convertedBuffer = await this.convertIfNeeded(buffer, fileExtension);
      const convertedKey = `converted/${expenseId}.pdf`;
      await this.uploadToR2(convertedBuffer, convertedKey, 'application/pdf');
      
      return {
        originalUrl: await this.getSignedUrl(originalKey),
        convertedUrl: await this.getSignedUrl(convertedKey),
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error storing receipt: ${err.message}`, err.stack);
      throw error;
    }
  }

  private async uploadToR2(buffer: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  private async convertIfNeeded(buffer: Buffer, fileExtension: string): Promise<Buffer> {
    // Implement conversion logic here
    return buffer;
  }

  private async getSignedUrl(key: string): Promise<string> {
    return `https://${this.bucket}.r2.cloudflarestorage.com/${key}`;
  }
} 