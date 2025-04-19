import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export class Budget {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'monthly' })
  period: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
