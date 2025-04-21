import type { Types } from "mongoose";

import type { Receipt } from "./index";

export interface ReceiptDocument extends Omit<Receipt, "id" | "_id"> {
  _id: Types.ObjectId;
  id: string;
}

export interface ReceiptMetadata {
  location?: {
    latitude: number;
    longitude: number;
  };
  paymentMethod?: string;
  text?: string;
  ocrData?: {
    text: string;
    confidence: number;
  };
}

export interface ReceiptMatchResult {
  transactionId: string;
  confidence: number;
  matchedFields: string[];
}

export interface ReceiptProcessingOptions {
  generateThumbnail?: boolean;
  optimizeImage?: boolean;
  extractText?: boolean;
  detectLocation?: boolean;
}

export interface ReceiptProcessingResult {
  receipt: ReceiptDocument;
  metadata: ReceiptMetadata;
  matchResult?: ReceiptMatchResult;
}
