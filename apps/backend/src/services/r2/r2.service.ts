import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { HfInference } from '@huggingface/inference';
import { RateLimits } from '../rateLimiter';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import { Throttle } from '@nestjs/throttler';

interface UploadResult {
  key: string;
  url: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
}

interface HuggingFaceOCRResult {
  text: string;
  confidence: number;
}

interface HuggingFaceClassificationResult {
  label: string;
  score: number;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly hf: HfInference;
  private readonly rateLimiter: RateLimits;
  private s3: S3;
  private readonly huggingFaceApiKey: string;
  private readonly huggingFaceOcrEndpoint: string;
  private readonly huggingFaceClassificationEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    const huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');

    if (!bucketName || !publicUrl || !endpoint || !accessKeyId || !secretAccessKey || !huggingfaceApiKey) {
      throw new Error('Missing required configuration for R2Service');
    }

    this.bucket = bucketName;
    this.publicUrl = publicUrl;
    this.huggingFaceApiKey = huggingfaceApiKey;

    const s3Config: S3ClientConfig = {
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    this.s3Client = new S3Client(s3Config);
    this.hf = new HfInference(huggingfaceApiKey);
    this.rateLimiter = new RateLimits({
      'huggingface-api': {
        maxRequests: 100,
        timeWindow: 60 * 1000, // 1 minute
      },
    });

    this.s3 = new S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      region: 'auto',
    });

    this.huggingFaceOcrEndpoint = 'https://api-inference.huggingface.co/models/microsoft/trocr-base-handwritten';
    this.huggingFaceClassificationEndpoint = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
  }

  private generateKey(userId: string, filename: string): string {
    const ext = path.extname(filename);
    return `receipts/${userId}/${uuidv4()}${ext}`;
  }

  private generateThumbnailKey(originalKey: string): string {
    const ext = path.extname(originalKey);
    const baseKey = originalKey.slice(0, -ext.length);
    return `${baseKey}_thumb${ext}`;
  }

  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
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

  private async handleS3Operation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Error in ${operationName}:`, error);
      throw error;
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<void> {
    await this.handleS3Operation(
      () =>
        this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          })
        ),
      'uploading to S3'
    );
  }

  private async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.handleS3Operation(
      async () => {
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn });
      },
      'generating signed URL'
    );
  }

  async uploadFile(
    buffer: Buffer,
    options: {
      userId: string;
      filename: string;
      mimeType: string;
      generateThumbnail?: boolean;
    }
  ): Promise<UploadResult> {
    const key = this.generateKey(options.userId, options.filename);
    const thumbnailKey = options.generateThumbnail ? this.generateThumbnailKey(key) : undefined;

    // Upload original file
    await this.uploadToS3(buffer, key, options.mimeType);

    let thumbnailUrl: string | undefined;
    if (options.generateThumbnail && thumbnailKey) {
      // Generate and upload thumbnail
      const thumbnail = await this.generateThumbnail(buffer);
      await this.uploadToS3(thumbnail, thumbnailKey, options.mimeType);
      thumbnailUrl = await this.getSignedUrl(thumbnailKey);
    }

    const url = await this.getSignedUrl(key);

    return {
      key,
      url,
      thumbnailKey,
      thumbnailUrl,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.handleS3Operation(
      () =>
        this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          })
        ),
      'deleting file from S3'
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  @Throttle({ default: { ttl: 60, limit: 30 } }) // 30 requests per minute for OCR
  async processReceiptWithHuggingFace(file: Buffer): Promise<{
    text: string;
    confidence: number;
    category: string;
  }> {
    await this.rateLimiter.checkLimit('huggingface-api');

    // OCR text extraction
    const ocrResult = await this.hf.imageToText({
      data: file,
      model: 'impira/layoutlm-document-qa',
    });

    // Category classification
    const classificationResult = await this.hf.textClassification({
      model: 'facebook/bart-large-mnli',
      inputs: ocrResult.text,
      parameters: {
        candidate_labels: ['food', 'transportation', 'entertainment', 'utilities', 'shopping'],
      },
    });

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      category: classificationResult[0].label,
    };
  }

  public async processImage(file: Buffer): Promise<Buffer> {
    return sharp(file)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  @Throttle({ default: { ttl: 60, limit: 30 } }) // 30 requests per minute for OCR
  public async ocrImage(file: Buffer): Promise<HuggingFaceOCRResult> {
    const response = await axios.post(
      this.huggingFaceOcrEndpoint,
      file,
      {
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'image/jpeg',
        },
      }
    );

    return {
      text: response.data[0].generated_text,
      confidence: response.data[0].score,
    };
  }

  @Throttle({ default: { ttl: 60, limit: 30 } }) // 30 requests per minute for classification
  public async classifyImage(file: Buffer): Promise<HuggingFaceClassificationResult> {
    const response = await axios.post(
      this.huggingFaceClassificationEndpoint,
      file,
      {
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'image/jpeg',
        },
      }
    );

    return {
      label: response.data[0].label,
      score: response.data[0].score,
    };
  }
}