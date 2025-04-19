import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseTransactionData } from '@fresh-expense/types';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction implements BaseTransactionData {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop()
  category?: string;

  @Prop()
  merchant?: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  location?: {
    latitude: number;
    longitude: number;
  };

  @Prop()
  metadata?: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 