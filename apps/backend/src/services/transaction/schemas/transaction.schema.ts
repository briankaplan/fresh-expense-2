import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  externalId: string;

  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  category?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['expense', 'income', 'transfer'] })
  type: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status: string;

  @Prop()
  merchant?: string;

  @Prop()
  location?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 