import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  accountId!: string;

  @Prop({ required: true })
  externalId!: string;

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

  @Prop()
  runningBalance!: number;

  @Prop()
  merchantName?: string;

  @Prop()
  merchantCategory?: string;

  @Prop()
  merchantLocation?: string;

  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop()
  category?: string[];

  @Prop()
  counterparty?: string;

  @Prop()
  processingStatus?: string;

  @Prop()
  source?: string;

  @Prop()
  lastUpdated?: Date;

  @Prop()
  originalPayload?: any;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 