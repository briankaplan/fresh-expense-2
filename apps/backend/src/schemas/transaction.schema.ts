import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  externalId!: string;

  @Prop({ required: true })
  accountId!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, enum: ['debit', 'credit'] })
  type!: string;

  @Prop({ required: true, enum: ['pending', 'posted', 'canceled'] })
  status!: string;

  @Prop({ type: [String], default: [] })
  category!: string[];

  @Prop({ default: 'processed' })
  processingStatus!: string;

  @Prop({ required: true })
  runningBalance!: number;

  @Prop({ required: true, default: 'teller' })
  source!: string;

  @Prop({ required: true })
  lastUpdated!: Date;

  @Prop()
  merchantName?: string;

  @Prop()
  merchantCategory?: string;

  @Prop()
  location?: string;

  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop({ type: Object })
  originalPayload!: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 