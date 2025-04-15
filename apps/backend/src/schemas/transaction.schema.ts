import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionCategory } from '@packages/utils';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  accountId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ['debit', 'credit'] })
  type!: string;

  @Prop({ required: true, enum: ['pending', 'posted', 'canceled'] })
  status!: string;

  @Prop()
  category?: string[];

  @Prop()
  merchant?: string;

  @Prop()
  merchantName?: string;

  @Prop()
  merchantCategory?: string;

  @Prop({
    type: {
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    }
  })
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };

  @Prop()
  runningBalance?: number;

  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop()
  notes?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  lastUpdated?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
