import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';
import { ExpenseCategory } from '../lib/types';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId | string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  size!: number;

  @Prop({ type: String })
  category?: ExpenseCategory;

  @Prop({ required: true })
  merchant!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Object, required: false })
  ocrData?: {
    text?: string;
    confidence?: number;
    items?: Array<{
      description: string;
      amount: number;
    }>;
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Receipt>) {
    Object.assign(this, partial);
  }
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Indexes
ReceiptSchema.index({ userId: 1, date: -1 });
ReceiptSchema.index({ userId: 1, merchant: 1 });
ReceiptSchema.index({ userId: 1, category: 1 });
ReceiptSchema.index({ userId: 1, amount: 1 });
ReceiptSchema.index({ userId: 1, tags: 1 });
