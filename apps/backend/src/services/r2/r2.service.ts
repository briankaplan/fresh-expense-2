import * as path from "node:path";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HfInference } from "@huggingface/inference";
import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { Types } from "mongoose";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { v4 as uuidv4 } from "uuid";

import type { RateLimiterService } from "../rate-limiter.service";

interface UploadResult {
  _id?: Types.ObjectId;
  key: string;
  url: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReceiptItem {
  _id?: Types.ObjectId;
  description: string;
  amount: number;
  quantity?: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReceiptData {
  _id?: Types.ObjectId;
  rawText: string;
  total?: number;
  date?: Date;
  merchantName?: string;
  items?: ReceiptItem[];
  metadata?: Record<string, any>;
  status?: "pending" | "processed" | "failed";
  processingConfidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProcessReceiptResult {
  _id?: Types.ObjectId;
  data: ReceiptData;
  confidence: number;
  processingTime?: number;
  createdAt?: Date;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly hf: HfInference;

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimiterService: RateLimiterService,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get<string>("R2_REGION") || "auto",
      endpoint: this.configService.get<string>("R2_ENDPOINT"),
      credentials: {
        accessKeyId: this.configService.get<string>("R2_ACCESS_KEY_ID") || "",
        secretAccessKey: this.configService.get<string>("R2_SECRET_ACCESS_KEY") || "",
      },
    });
    this.bucket = this.configService.get<string>("R2_BUCKET") || "";
    const publicUrl = this.configService.get<string>("R2_PUBLIC_URL");
    const huggingfaceApiKey = this.configService.get<string>("HUGGING_FACE_API_KEY");

    if (!publicUrl || !huggingfaceApiKey) {
      throw new Error("Missing required configuration for R2Service");
    }

    this.publicUrl = publicUrl;
    this.hf = new HfInference(huggingfaceApiKey);

    // Set up rate limits for Hugging Face API
    this.rateLimiterService.setLimit("huggingface-api", {
      maxRequests: 100,
      timeWindow: 60 * 1000, // 1 minute
      backoffStrategy: "exponential",
      maxRetries: 3,
    });
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
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
    } catch (error) {
      this.logger.error("Error generating thumbnail:", error);
      throw error;
    }
  }

  private async handleS3Operation<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Error in ${operationName}:`, error);
      throw error;
    }
  }

  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<void> {
    await this.handleS3Operation(
      () =>
        this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          }),
        ),
      "uploading to S3",
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.handleS3Operation(async () => {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return getSignedUrl(this.s3, command, { expiresIn });
    }, "generating signed URL");
  }

  async uploadFile(
    buffer: Buffer,
    options: {
      userId: string;
      filename: string;
      mimeType: string;
      generateThumbnail?: boolean;
    },
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
        this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          }),
        ),
      "deleting file from S3",
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async processReceipt(imageBuffer: Buffer): Promise<ProcessReceiptResult> {
    try {
      // First try Hugging Face OCR
      const result = await this.hf.textGeneration({
        inputs: imageBuffer.toString("base64"),
        model: "microsoft/trocr-base-printed",
      });

      if (result?.generated_text) {
        const parsedData = this.parseLines(result.generated_text);
        return {
          data: parsedData,
          confidence: 0.8, // Arbitrary confidence for HF
        };
      }

      // Fallback to Tesseract if HF fails
      const worker = await createWorker();
      const {
        data: { text, confidence },
      } = await worker.recognize(imageBuffer);
      await worker.terminate();

      const parsedData = this.parseLines(text);
      return {
        data: parsedData,
        confidence: confidence / 100, // Convert Tesseract confidence to 0-1 scale
      };
    } catch (error) {
      this.logger.error("Error processing receipt:", error);
      throw error;
    }
  }

  private parseLines(text: string): ReceiptData {
    const lines = text.split("\n").filter((line: string) => line.trim().length > 0);

    const data: ReceiptData = {
      _id: new Types.ObjectId(),
      rawText: text,
      total: 0,
      date: new Date(),
      merchantName: "",
      items: [],
      status: "processed",
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };

    return data;
  }
}
