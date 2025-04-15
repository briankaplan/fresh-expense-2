import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  merchant!: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ type: Types.ObjectId, ref: 'Receipt' })
  receiptId?: Types.ObjectId;

  @Prop({ default: false })
  matched!: boolean;

  @Prop()
  matchedAt?: Date;

  @Prop()
  unmatchedAt?: Date;

  @Prop({ enum: ['mongodb', 'teller', 'auto'], default: 'auto' })
  source!: string;

  @Prop({ type: Object })
  googleAuth?: {
    userId?: string;
    email?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
  };
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Add indexes for better query performance
ExpenseSchema.index({ date: 1 });
ExpenseSchema.index({ merchant: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ matched: 1 });
ExpenseSchema.index({ source: 1 });
ExpenseSchema.index({ 'googleAuth.userId': 1 });
ExpenseSchema.index({ 'googleAuth.tokenExpiry': 1 });
