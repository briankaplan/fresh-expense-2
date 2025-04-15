import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { OCRResult } from '../types/ocr.types';

export type ReceiptDocument = Receipt & Document;

export interface ReceiptItem {
  description: string;
  amount: number;
  quantity?: number;
  price?: number;
  category?: string;
}

export interface ExtractedData {
  merchant: string | null;
  amount: number | null;
  date: Date | null;
  items: ReceiptItem[] | null;
  confidence?: number;
  headerPattern?: string;
  footerPattern?: string;
}

@Schema({
  timestamps: true,
  collection: 'receipts',
})
export class Receipt {
  @Prop({ required: true })
  expenseId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  r2Key: string;

  @Prop()
  r2ThumbnailKey?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  urls: {
    fullImageUrl?: string;
    thumbnailUrl?: string;
  };

  @Prop({ required: true })
  status: 'processing' | 'unmatched' | 'matched' | 'error';

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  ocrData?: OCRResult;

  @Prop({ required: true })
  source: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL' | 'UPLOAD';

  @Prop({ required: true })
  merchant: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  category?: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  extractedData?: ExtractedData;

  @Prop()
  originalFilename?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  fileSize?: number;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.Mixed }] })
  items?: ReceiptItem[];
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Add indexes for common queries
ReceiptSchema.index({ userId: 1, date: -1 });
ReceiptSchema.index({ expenseId: 1 });
ReceiptSchema.index({ merchant: 1 });
ReceiptSchema.index({ category: 1 });
ReceiptSchema.index({ tags: 1 });
