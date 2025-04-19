import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from './base.schema';
import { ExpenseCategory } from '../lib/types';
import { TransactionAmount, TransactionMerchant } from '../interfaces/transaction.interface';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({
    required: true,
    type: {
      value: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' }
    }
  })
  amount!: TransactionAmount;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, type: String })
  category!: ExpenseCategory;

  @Prop({
    required: true,
    type: {
      name: { type: String, required: true },
      category: { type: String, required: false },
      website: { type: String, required: false },
      logo: { type: String, required: false }
    }
  })
  merchant!: TransactionMerchant;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status!: 'pending' | 'completed' | 'failed';

  @Prop({ type: Object, required: false })
  receipt?: {
    id: string;
    url: string;
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, amount: 1 });
TransactionSchema.index({ userId: 1, merchant: 1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ userId: 1, tags: 1 });
