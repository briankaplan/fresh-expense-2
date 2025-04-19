import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';

export interface SubscriptionPayment {
  amount: number;
  date: Date;
  receiptId?: Types.ObjectId;
  transactionId?: Types.ObjectId;
}

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;
  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  merchant!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, enum: ['monthly', 'annual', 'weekly'] })
  frequency!: 'monthly' | 'annual' | 'weekly';

  @Prop({ required: true })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true, enum: ['active', 'cancelled', 'paused'] })
  status!: 'active' | 'cancelled' | 'paused';

  @Prop({ type: [Object] })
  payments!: SubscriptionPayment[];

  @Prop()
  lastPaymentDate?: Date;

  @Prop()
  nextPaymentDate?: Date;

  @Prop()
  cancellationDate?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Object })
  metadata?: {
    source: string;
    confidence: number;
    lastUpdated: Date;
    notes?: string;
  };

  constructor(partial: Partial<Subscription>) {
    Object.assign(this, partial);
  }
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Indexes
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ merchant: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ 'payments.date': -1 });
SubscriptionSchema.index({ nextPaymentDate: 1 });
