import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface IReceipt {
  userId: Types.ObjectId;
  merchant: string;
  amount: number;
  date: Date;
  category?: string;
  tags?: string[];
  r2Key: string;
  r2ThumbnailKey: string;
  fullImageUrl?: string;
  thumbnailUrl?: string;
  transactionId?: Types.ObjectId;
  source: string;
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
    originalSize?: number;
    processedSize?: number;
    text?: string;
    confidence?: number;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
  ocrData?: {
    text: string;
    confidence: number;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
}

export type ReceiptDocument = Receipt & Document & {
  _id: Types.ObjectId;
  r2Key: string;
  r2ThumbnailKey: string;
  fullImageUrl: string;
  thumbnailUrl: string;
};

@Schema({ timestamps: true })
export class Receipt implements IReceipt {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  merchant: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop()
  category?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ required: true })
  r2Key: string;

  @Prop({ required: true })
  r2ThumbnailKey: string;

  @Prop()
  fullImageUrl?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: Types.ObjectId })
  transactionId?: Types.ObjectId;

  @Prop({ default: 'MANUAL', enum: ['MANUAL', 'CSV', 'EMAIL', 'GOOGLE_PHOTOS'] })
  source: string;

  @Prop({
    type: {
      mimeType: String,
      size: Number,
      processedAt: Date,
      originalSize: Number,
      processedSize: Number,
      text: String,
      confidence: Number,
      items: [{
        description: String,
        amount: Number,
        quantity: Number
      }]
    }
  })
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
    originalSize?: number;
    processedSize?: number;
    text?: string;
    confidence?: number;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };

  @Prop({
    type: {
      text: String,
      confidence: Number,
      items: [{
        description: String,
        amount: Number,
        quantity: Number
      }]
    }
  })
  ocrData?: {
    text: string;
    confidence: number;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Add text index for search functionality
ReceiptSchema.index({ merchant: 'text', 'metadata.text': 'text', 'ocrData.text': 'text' });

// Add compound index for efficient querying
ReceiptSchema.index({ userId: 1, date: -1 });

// Add index for transaction matching
ReceiptSchema.index({ userId: 1, amount: 1, date: 1 }); 