import type { BaseDocument } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type Document, Types } from "mongoose";

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId!: string;

  @Prop({ required: true })
  accountId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: "USD" })
  currency!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  description!: string;

  @Prop()
  merchantName?: string;

  @Prop()
  merchantId?: string;

  @Prop()
  category?: string;

  @Prop()
  subcategory?: string;

  @Prop()
  tags?: string[];

  @Prop()
  receiptId?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop()
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    startDate: Date;
    endDate?: Date;
  };

  @Prop({ default: false })
  isSplit!: boolean;

  @Prop()
  splits?: {
    userId: string;
    amount: number;
    percentage: number;
    status: "pending" | "approved" | "rejected";
  }[];

  @Prop()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @Prop()
  paymentMethod?: string;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add indexes for common queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, amount: 1 });
TransactionSchema.index({ userId: 1, merchantName: 1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, paymentMethod: 1 });
TransactionSchema.index({ userId: 1, location: "2dsphere" });
TransactionSchema.index({ userId: 1, isRecurring: 1 });
TransactionSchema.index({ userId: 1, isSplit: 1 });
