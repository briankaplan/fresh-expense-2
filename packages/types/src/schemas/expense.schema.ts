import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';
import { ExpenseCategory, ExpenseStatus } from '../lib/types';
import { EXPENSE_CATEGORIES } from '../constants/category.constants';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense extends BaseDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId | string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId!: Types.ObjectId | string;

  @Prop({ required: true })
  date!: Date;

  @Prop({
    required: true,
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
    },
  })
  amount!: {
    amount: number;
    currency: string;
  };

  @Prop({ required: true })
  description!: string;

  @Prop({
    type: String,
    required: true,
    enum: EXPENSE_CATEGORIES,
  })
  category!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({
    required: true,
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status!: ExpenseStatus;

  @Prop({ type: Date })
  reportedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Receipt' })
  receiptId?: Types.ObjectId;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Object })
  metadata?: {
    project?: string;
    department?: string;
    costCenter?: string;
    [key: string]: any;
  };
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Indexes
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, date: -1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ tags: 1 });
ExpenseSchema.index({ 'amount.amount': 1 });
ExpenseSchema.index({ 'amount.currency': 1 });
