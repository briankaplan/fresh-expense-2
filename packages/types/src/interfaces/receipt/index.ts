import type { ReceiptDocument } from "../../schemas/receipt.schema";

/**
 * Options for processing a receipt
 */
export interface ReceiptProcessingOptions {
  /**
   * Whether to validate the receipt data
   * @default true
   */
  validate?: boolean;

  /**
   * Whether to process attachments
   * @default true
   */
  processAttachments?: boolean;

  /**
   * Whether to enrich the receipt data
   * @default true
   */
  enrichData?: boolean;

  /**
   * Whether to store the receipt document
   * @default true
   */
  storeDocument?: boolean;

  /**
   * Additional metadata to include
   */
  metadata?: Record<string, any>;
}

/**
 * Result of processing a receipt
 */
export interface ReceiptProcessingResult {
  /**
   * Whether the processing was successful
   */
  success: boolean;

  /**
   * The processed receipt document
   */
  document: ReceiptDocument;

  /**
   * Any errors that occurred during processing
   */
  errors?: Error[];

  /**
   * Processing metadata
   */
  metadata?: {
    /**
     * Time taken to process the receipt in milliseconds
     */
    processingTime: number;

    /**
     * Number of attachments processed
     */
    attachmentsProcessed: number;

    /**
     * Whether the receipt was enriched
     */
    enriched: boolean;
  };
}
