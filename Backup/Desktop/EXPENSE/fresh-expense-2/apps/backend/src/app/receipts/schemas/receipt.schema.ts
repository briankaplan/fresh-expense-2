import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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
  collection: 'receipts'
})
export class Receipt {
  @Prop({ required: true })
  expenseId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  urls: {
    original: string;
    converted?: string;
    thumbnail?: string;
  };

  @Prop({ required: true })
  source: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL' | 'UPLOAD';

  @Prop({ required: true })
  merchant: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  ocrData?: {
    text: string;
    confidence: number;
    metadata: any;
    processedAt: Date;
  };

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

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: {
    r2Keys?: {
      original?: string;
      converted?: string;
      thumbnail?: string;
    };
    processingStatus?: string;
    version?: number;
    importDate?: Date;
    source?: string;
    lastProcessed?: Date;
  };
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Add indexes for common queries
ReceiptSchema.index({ userId: 1, date: -1 });
ReceiptSchema.index({ expenseId: 1 });
ReceiptSchema.index({ merchant: 1 });
ReceiptSchema.index({ category: 1 });
ReceiptSchema.index({ tags: 1 }); 