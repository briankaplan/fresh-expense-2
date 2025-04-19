import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '@fresh-expense/types';

export type MetricsDocument = Metrics & Document;

@Schema({ timestamps: true })
export class Metrics implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  period!: string; // e.g., '2023-01', '2023-Q1', '2023'

  @Prop({ type: Object })
  spendingByCategory!: Record<string, number>;

  @Prop({ type: Object })
  spendingByMerchant!: Record<string, number>;

  @Prop({ type: Object })
  spendingByDay!: Record<string, number>;

  @Prop({ type: Object })
  spendingByWeek!: Record<string, number>;

  @Prop({ type: Object })
  spendingByMonth!: Record<string, number>;

  @Prop({ default: 0 })
  totalSpent!: number;

  @Prop({ default: 0 })
  totalIncome!: number;

  @Prop({ default: 0 })
  netIncome!: number;

  @Prop({ type: Object })
  budgetStatus!: Record<
    string,
    {
      allocated: number;
      spent: number;
      remaining: number;
      percentage: number;
    }
  >;

  @Prop({ type: Object })
  recurringExpenses!: Record<
    string,
    {
      count: number;
      total: number;
      average: number;
    }
  >;

  @Prop({ type: Object })
  splitExpenses!: Record<
    string,
    {
      count: number;
      total: number;
      average: number;
    }
  >;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Metrics>) {
    Object.assign(this, partial);
  }
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);
