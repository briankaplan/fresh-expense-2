import { ReceiptDocument } from "@fresh-expense/types";
import type { R2Service } from "@fresh-expense/utils";
import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

interface UploadResult {
  originalKey: string;
  thumbnailKey: string;
  originalUrl: string;
  thumbnailUrl: string;
}

@Injectable()
export class ReceiptUploadService {
  private readonly logger = new Logger(ReceiptUploadService.name);
  private readonly receiptsBucket: string;
  private readonly thumbnailsBucket: string;

  constructor(
    private readonly r2Service: R2Service,
    private readonly configService: ConfigService,
  ) {
    this.receiptsBucket = this.configService.getOrThrow<string>("R2_RECEIPTS_BUCKET");
    this.thumbnailsBucket = this.configService.getOrThrow<string>("R2_THUMBNAILS_BUCKET");
  }

  async uploadReceipt(
    userId: string,
    file: Buffer,
    filename: string,
    metadata: { merchant: string; amount: number; date: Date },
  ): Promise<UploadResult> {
    try {
      // Generate standardized filename
      const standardizedName = this.generateStandardizedName(metadata, filename);

      // Upload original
      const originalKey = `${userId}/${standardizedName}`;
      await this.r2Service.uploadFile(this.receiptsBucket, originalKey, file);
      const originalUrl = await this.r2Service.getFileUrl(this.receiptsBucket, originalKey);

      // Generate and upload thumbnail
      const thumbnail = await this.generateThumbnail(file);
      const thumbnailKey = `${userId}/thumb_${standardizedName}`;
      await this.r2Service.uploadFile(this.thumbnailsBucket, thumbnailKey, thumbnail);
      const thumbnailUrl = await this.r2Service.getFileUrl(this.thumbnailsBucket, thumbnailKey);

      return {
        originalKey,
        thumbnailKey,
        originalUrl,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error("Error uploading receipt:", error);
      throw error;
    }
  }

  private generateStandardizedName(
    metadata: { merchant: string; amount: number; date: Date },
    originalName: string,
  ): string {
    const date = metadata.date.toISOString().split("T")[0];
    const merchant = metadata.merchant.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const amount = metadata.amount.toFixed(2);
    const extension = originalName.split(".").pop();

    return `${date}-${merchant}-${amount}.${extension}`;
  }

  private async generateThumbnail(file: Buffer): Promise<Buffer> {
    // TODO: Implement thumbnail generation using sharp
    // 1. Resize image to max 300px width/height
    // 2. Convert to webp format
    // 3. Optimize for web
    return file;
  }
}
