export interface ReceiptLocation {
  latitude: number;
  longitude: number;
}

export interface ReceiptOCRData {
  text: string;
  confidence: number;
}

export interface ReceiptMetadata {
  location?: ReceiptLocation;
  paymentMethod?: string;
  text?: string;
  ocrData?: ReceiptOCRData;
}

export interface Receipt {
  id: string;
  userId: string;
  transactionId?: string;
  merchant: string;
  amount: number;
  date: Date;
  category?: string;
  status: 'pending' | 'processed' | 'matched' | 'review';
  matchConfidence?: number;
  metadata?: ReceiptMetadata;
  r2Key: string;
  r2ThumbnailKey?: string;
  fullImageUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
