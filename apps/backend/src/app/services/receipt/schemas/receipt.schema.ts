import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  merchant!: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ type: Types.ObjectId, ref: 'Expense' })
  transactionId?: Types.ObjectId;

  @Prop({ default: false })
  matched!: boolean;

  @Prop()
  matchedAt?: Date;

  @Prop()
  unmatchedAt?: Date;

  @Prop()
  imageUrl?: string;

  @Prop()
  textContent?: string;

  @Prop({ type: Object })
  metadata?: {
    fileType?: string;
    fileSize?: number;
    uploadDate?: Date;
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  };

  @Prop({ type: Object })
  googleAuth?: {
    userId?: string;
    email?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
  };
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Add indexes for better query performance
ReceiptSchema.index({ date: 1 });
ReceiptSchema.index({ merchant: 1 });
ReceiptSchema.index({ category: 1 });
ReceiptSchema.index({ matched: 1 });
ReceiptSchema.index({ 'metadata.processingStatus': 1 });
ReceiptSchema.index({ 'googleAuth.userId': 1 });
ReceiptSchema.index({ 'googleAuth.tokenExpiry': 1 }); 