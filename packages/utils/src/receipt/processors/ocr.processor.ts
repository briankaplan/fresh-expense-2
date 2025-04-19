import { type OCRDocument, OCRStatus } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import {
  BaseReceiptProcessor,
  type ProcessingOptions,
  type ProcessingResult,
} from "./base.processor";

@Injectable()
export class OCRProcessor extends BaseReceiptProcessor {
  private readonly logger = new Logger(OCRProcessor.name);

  async processSMS(doc: OCRDocument, options: ProcessingOptions = {}): Promise<ProcessingResult> {
    try {
      // Validate document
      if (options.validate && !this.validateDocument(doc)) {
        return { success: false, error: "Invalid document" };
      }

      // Update status to processing
      doc.status = OCRStatus.PROCESSING;
      doc.processing = {
        ...doc.processing,
        startedAt: new Date(),
        steps: [
          ...(doc.processing?.steps || []),
          {
            name: "start",
            status: "matched",
            completedAt: new Date(),
          },
        ],
      };

      // Process image content
      const contentResult = await this.processContent(doc.image, options);
      if (!contentResult.success) {
        return contentResult;
      }

      // Enrich data
      if (options.enrich) {
        const enrichmentResult = await this.enrichData(doc, options);
        if (!enrichmentResult.success) {
          return enrichmentResult;
        }
      }

      // Store document
      if (options.store) {
        const storageResult = await this.storeDocument(doc, options);
        if (!storageResult.success) {
          return storageResult;
        }
      }

      // Update status
      doc.status = OCRStatus.PROCESSED;
      doc.processing = {
        ...doc.processing,
        completedAt: new Date(),
        steps: [
          ...(doc.processing?.steps || []),
          {
            name: "finalize",
            status: "matched",
            completedAt: new Date(),
          },
        ],
      };

      return { success: true, data: doc };
    } catch (error) {
      doc.status = OCRStatus.FAILED;
      doc.processing = {
        ...doc.processing,
        error: error instanceof Error ? error.message : "Unknown error",
        steps: [
          ...(doc.processing?.steps || []),
          {
            name: "error",
            status: "matched",
            completedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async processSendGrid(): Promise<ProcessingResult> {
    throw new Error("SendGrid processing not supported by OCR processor");
  }

  protected async processContent(
    image: Buffer | string,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      // Implement OCR processing logic
      // - Extract text from image
      // - Parse amounts and dates
      // - Identify merchant information
      // - Validate extracted data

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Content processing failed",
      };
    }
  }

  protected validateDocument(doc: OCRDocument): boolean {
    return !!(doc.userId && doc.companyId && doc.image && doc.type);
  }
}
