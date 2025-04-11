import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface UploadResult {
  key: string;
  url: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  generateKey(userId: string, filename: string): string {
    const ext = path.extname(filename);
    return `receipts/${userId}/${uuidv4()}${ext}`;
  }

  generateThumbnailKey(originalKey: string): string {
    const ext = path.extname(originalKey);
    const baseKey = originalKey.slice(0, -ext.length);
    return `${baseKey}_thumb${ext}`;
  }

  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async uploadReceipt(
    buffer: Buffer,
    mimeType: string,
    originalFilename: string
  ): Promise<UploadResult> {
    try {
      const ext = path.extname(originalFilename);
      const baseKey = `receipts/${uuidv4()}`;
      const key = `${baseKey}${ext}`;
      const thumbnailKey = `${baseKey}_thumb${ext}`;

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(buffer);

      // Upload original file
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      );

      // Upload thumbnail
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnail,
          ContentType: mimeType,
        })
      );

      // Get signed URLs
      const url = await this.getSignedUrl(key);
      const thumbnailUrl = await this.getSignedUrl(thumbnailKey);

      return {
        key,
        thumbnailKey,
        url,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error('Error uploading receipt to R2:', error);
      throw error;
    }
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const url = await this.getSignedUrl(key);
      return { key, url };
    } catch (error) {
      this.logger.error(`Error uploading file to R2: ${error}`);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating signed URL: ${error}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Error deleting file from R2: ${error}`);
      throw error;
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
} 