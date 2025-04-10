import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({
  timestamps: true,
  collection: 'expenses'
})
export class Expense {
  @Prop({ required: true })
  transactionDate: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  merchant: string;

  @Prop()
  category: string;

  @Prop()
  receiptStatus: 'FOUND' | 'MISSING' | 'PROCESSING';

  @Prop()
  receiptUrls?: {
    original: string;
    converted: string;
  };

  @Prop()
  receiptSource?: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL';

  @Prop()
  ocrData?: {
    text: string;
    confidence: number;
    processedAt: Date;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  tellerTransaction?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  enrichmentData?: any;

  @Prop()
  companyId: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 