export interface ExtractedReceiptData {
  merchant: string | null;
  date: Date | null;
  amount: number | null;
  items: string[];
  transactionId?: string;
  paymentMethod?: string;
  tax?: number;
  rawText?: string;
  confidence?: number;
} 