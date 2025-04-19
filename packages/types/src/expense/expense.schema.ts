import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../schemas/base.schema';
import { ExpenseCategory, ExpenseStatus } from '../lib/types';
import { EXPENSE_CATEGORIES } from '../constants/category.constants';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

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

  constructor(partial: Partial<Expense>) {
    Object.assign(this, partial);
  }
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 