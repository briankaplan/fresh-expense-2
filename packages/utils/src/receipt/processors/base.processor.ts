import type { SendgridDocument, SmsDocument } from "@fresh-expense/types";
import { Injectable } from "@nestjs/common";

export interface ProcessingResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ProcessingOptions {
  validate?: boolean;
  enrich?: boolean;
  store?: boolean;
  notificationEmail?: string;
  forwardTo?: string[];
}

@Injectable()
export abstract class BaseReceiptProcessor {
  abstract processSendGrid(
    doc: SendgridDocument,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult>;
  abstract processSMS(doc: SmsDocument, options?: ProcessingOptions): Promise<ProcessingResult>;

  protected validateDocument(doc: SendgridDocument | SmsDocument): boolean {
    // Basic validation that applies to both types
    return !!(doc.userId && doc.status && doc.metadata);
  }

  protected async processAttachments(
    attachments: any[],
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common attachment processing logic
    return { success: true };
  }

  protected async enrichData(
    doc: SendgridDocument | SmsDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common enrichment logic
    return { success: true };
  }

  protected async storeDocument(
    doc: SendgridDocument | SmsDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common storage logic
    return { success: true };
  }
}
