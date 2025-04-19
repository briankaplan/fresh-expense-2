import { type SendGridDocument, SendGridStatus } from "@fresh-expense/types";
import { Injectable } from "@nestjs/common";
import {
  BaseReceiptProcessor,
  type ProcessingOptions,
  type ProcessingResult,
} from "./base.processor";

@Injectable()
export class SendGridProcessor extends BaseReceiptProcessor {
  async processSendGrid(
    doc: SendGridDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      // Validate document
      if (options.validate && !this.validateDocument(doc)) {
        return { success: false, error: "Invalid document" };
      }

      // Process attachments
      if (doc.attachments?.length) {
        const attachmentResult = await this.processAttachments(doc.attachments, options);
        if (!attachmentResult.success) {
          return attachmentResult;
        }
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
      doc.status = SendGridStatus.PROCESSED;
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async processSMS(): Promise<ProcessingResult> {
    throw new Error("SMS processing not supported by SendGrid processor");
  }

  protected async processAttachments(
    attachments: SendGridDocument["attachments"],
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      // Process each attachment
      for (const attachment of attachments || []) {
        // Implement attachment processing logic
        // - Download from URL
        // - Extract text/content
        // - Store in appropriate location
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Attachment processing failed",
      };
    }
  }
}
