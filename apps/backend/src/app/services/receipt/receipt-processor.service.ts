import type { ReceiptDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import axios from "axios";

import type { ReceiptMatcherService } from "./receipt-matcher.service";
import type { ReceiptStorageService } from "./receipt-storage.service";

interface ProcessingResult {
  receipt: ReceiptDocument;
  confidence: number;
  extractedData: {
    merchant: string;
    amount: number;
    date: Date;
    items?: Array<{
      description: string;
      amount: number;
    }>;
    tax?: number;
    total?: number;
  };
}

@Injectable()
export class ReceiptProcessorService {
  private readonly logger = new Logger(ReceiptProcessorService.name);
  private readonly workerUrl: string;

  constructor(
    private readonly storageService: ReceiptStorageService,
    private readonly receiptMatcher: ReceiptMatcherService,
    private readonly configService: ConfigService,
  ) {
    this.workerUrl = this.configService.get<string>("CLOUDFLARE_WORKER_URL");
  }

  async processReceipt(userId: string, file: Buffer, filename: string): Promise<ProcessingResult> {
    try {
      // 1. Upload file to R2
      const r2Key = await this.storageService.uploadFile(userId, file, filename);

      // 2. Generate thumbnail
      const thumbnail = await this.storageService.generateThumbnail(file);
      const thumbnailKey = await this.storageService.uploadFile(
        userId,
        thumbnail,
        `thumb_${filename}`,
      );

      // 3. Perform OCR
      const formData = new FormData();
      formData.append("file", new Blob([file]));

      const ocrResponse = await axios.post(`${this.workerUrl}/ocr`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const ocrResult = ocrResponse.data;

      // 4. Extract structured data using AI
      const extractResponse = await axios.post(`${this.workerUrl}/extract`, {
        text: ocrResult.text,
      });

      const extractedData = extractResponse.data;

      // 5. Create receipt document
      const receipt = await this.createReceiptDocument({
        userId,
        r2Key,
        thumbnailKey,
        ocrText: ocrResult.text,
        extractedData,
      });

      // 6. Find potential matches
      const matches = await this.receiptMatcher.findMatchesForReceipt(receipt);

      return {
        receipt,
        confidence: matches[0]?.confidence || 0,
        extractedData,
      };
    } catch (error) {
      this.logger.error("Error processing receipt:", error);
      throw error;
    }
  }

  private async createReceiptDocument(data: {
    userId: string;
    r2Key: string;
    thumbnailKey: string;
    ocrText: string;
    extractedData: any;
  }): Promise<ReceiptDocument> {
    // TODO: Implement receipt document creation
    // This should:
    // 1. Create new receipt document
    // 2. Set all extracted fields
    // 3. Save to database
    return {} as ReceiptDocument;
  }
}
