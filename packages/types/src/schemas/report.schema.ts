import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';

export type ReportDocument = Report & Document;

export enum ReportType {
  EXPENSE = 'expense',
  INCOME = 'income',
  CASH_FLOW = 'cash_flow',
  BUDGET = 'budget',
  SUBSCRIPTION = 'subscription',
  TAX = 'tax',
  CUSTOM = 'custom',
}

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

@Schema({ timestamps: true })
export class Report implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId!: Types.ObjectId | string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ReportType })
  type!: ReportType;

  @Prop({ required: true, enum: ReportFrequency })
  frequency!: ReportFrequency;

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.DRAFT })
  status!: ReportStatus;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Date })
  lastGenerated?: Date;

  @Prop({ type: Date })
  nextGeneration?: Date;

  @Prop({ type: Object })
  filters?: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    categories?: string[];
    tags?: string[];
    minAmount?: number;
    maxAmount?: number;
    status?: string[];
    [key: string]: any;
  };

  @Prop({ type: Object })
  data?: {
    summary?: {
      totalAmount: number;
      averageAmount: number;
      count: number;
      [key: string]: any;
    };
    categories?: {
      name: string;
      amount: number;
      percentage: number;
      [key: string]: any;
    }[];
    timeSeries?: {
      date: Date;
      amount: number;
      [key: string]: any;
    }[];
    [key: string]: any;
  };

  @Prop({ type: [String], index: true })
  recipients?: string[];

  @Prop({ type: Boolean, default: false })
  isPublic!: boolean;

  @Prop({ type: [String], index: true })
  tags?: string[];

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata?: {
    format?: string;
    template?: string;
    [key: string]: any;
  };

  constructor(partial: Partial<Report>) {
    Object.assign(this, partial);
  }
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes
ReportSchema.index({ userId: 1, type: 1 });
ReportSchema.index({ companyId: 1, type: 1 });
ReportSchema.index({ status: 1, nextGeneration: 1 });
ReportSchema.index({ 'filters.dateRange.start': 1, 'filters.dateRange.end': 1 });
ReportSchema.index({ 'data.summary.totalAmount': 1 });
