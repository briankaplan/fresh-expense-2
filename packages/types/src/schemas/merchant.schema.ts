import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant extends BaseDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId | string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId!: Types.ObjectId | string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  state?: string;

  @Prop({ type: String })
  zipCode?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: [String], default: [] })
  categories!: string[];

  @Prop({ type: Number, default: 0 })
  transactionCount!: number;

  @Prop({ type: Number, default: 0 })
  totalSpent!: number;

  @Prop({ type: Date })
  lastTransactionDate?: Date;

  @Prop({ type: Object })
  metadata?: {
    [key: string]: any;
  };
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// Indexes
MerchantSchema.index({ userId: 1, name: 1 }, { unique: true });
MerchantSchema.index({ userId: 1, companyId: 1 });
MerchantSchema.index({ userId: 1, categories: 1 });
