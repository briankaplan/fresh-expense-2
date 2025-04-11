import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reported';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected', 'reported'], default: 'pending' })
  status: ExpenseStatus;

  @Prop({ type: Date })
  reportedAt?: Date;

  @Prop({ type: String })
  receiptId?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 