import { Injectable } from "@nestjs/common";
import type { SendgridDocument } from "@fresh-expense/types";

export interface ProcessingResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface ProcessingOptions {
  validate?: boolean;
  enrich?: boolean;
  store?: boolean;
  notificationEmail?: string;
  forwardTo?: string[];
}

export enum ProcessorType {
  SENDGRID = "sendgrid",
}

@Injectable()
export abstract class BaseReceiptProcessor {
  abstract processSendGrid(
    doc: SendgridDocument,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult>;

  abstract processReceipt(
    doc: SendgridDocument,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult>;

  protected validateDocument(doc: SendgridDocument): boolean {
    // Basic validation that applies to both types
    return !!(doc.userId && doc.status && doc.metadata);
  }

  protected async processAttachments(
    attachments: unknown[],
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common attachment processing logic
    return { success: true };
  }

  protected async enrichData(
    doc: SendgridDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common enrichment logic
    return { success: true };
  }

  protected async storeDocument(
    doc: SendgridDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    // Common storage logic
    return { success: true };
  }
}
