import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: true,
  collection: 'transactions',
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Transaction extends Document {
  @Prop({ required: true, unique: true, index: true })
  externalId: string;

  @Prop({ required: true, index: true })
  accountId: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  amount: number;

  @Prop({
    required: true,
    enum: ['debit', 'credit'],
    default: 'debit'
  })
  type: string;

  @Prop({
    required: true,
    enum: ['pending', 'posted', 'canceled'],
    default: 'posted'
  })
  status: string;

  @Prop([String])
  category: string[];

  @Prop({
    enum: ['processed', 'pending', 'failed'],
    default: 'processed'
  })
  processingStatus: string;

  @Prop({ type: Number })
  runningBalance: number;

  @Prop({ required: true, default: 'teller' })
  source: string;

  @Prop({ required: true })
  lastUpdated: Date;

  @Prop()
  matchedReceiptId?: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Object })
  originalPayload: Record<string, any>;

  // Additional fields for better tracking
  @Prop({ type: String })
  merchantName?: string;

  @Prop({ type: String })
  merchantCategory?: string;

  @Prop({ type: String })
  location?: string;

  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ type: Date })
  clearedDate?: Date;

  @Prop({ type: String })
  notes?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for common queries
TransactionSchema.index({ accountId: 1, date: -1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ merchantName: 1 });
TransactionSchema.index({ isRecurring: 1 });

// Compound indexes for common query patterns
TransactionSchema.index({ accountId: 1, status: 1, date: -1 });
TransactionSchema.index({ accountId: 1, category: 1, date: -1 });

// Virtual for formatted amount
TransactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(this.amount));
}); 