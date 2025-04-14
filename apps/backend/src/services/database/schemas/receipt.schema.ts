import { BaseSchema } from './base.schema';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  description?: string;
}

export interface ReceiptSchema extends BaseSchema {
  userId: string;
  merchantId: string;
  date: Date;
  totalAmount: number;
  taxAmount?: number;
  tipAmount?: number;
  currency: string;
  items: ReceiptItem[];
  paymentMethod?: string;
  receiptNumber?: string;
  imageUrl?: string;
  ocrData?: {
    rawText: string;
    confidence: number;
    processedAt: Date;
  };
  metadata?: {
    [key: string]: any;
  };
  isProcessed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export const RECEIPT_COLLECTION = 'receipts'; 