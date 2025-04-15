import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportTemplateDocument = ReportTemplate & Document;
export type ReportScheduleDocument = ReportSchedule & Document;
export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class ReportTemplate {
  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['expense', 'receipt', 'custom'] })
  type!: 'expense' | 'receipt' | 'custom';

  @Prop({ required: true, enum: ['pdf', 'csv', 'excel'] })
  format!: 'pdf' | 'csv' | 'excel';

  @Prop({
    type: {
      dateRange: {
        type: { type: String, enum: ['fixed', 'relative'] },
        start: Date,
        end: Date,
        relativePeriod: { type: String, enum: ['week', 'month', 'quarter', 'year'] },
      },
      categories: [String],
      merchants: [String],
      minAmount: Number,
      maxAmount: Number,
      tags: [String],
      hasReceipt: Boolean,
      customFilters: Object,
    },
  })
  filters!: {
    dateRange?: {
      type: 'fixed' | 'relative';
      start?: Date | string;
      end?: Date | string;
      relativePeriod?: 'week' | 'month' | 'quarter' | 'year';
    };
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
    hasReceipt?: boolean;
    customFilters?: Record<string, any>;
  };

  @Prop({ type: [String], enum: ['date', 'category', 'merchant', 'tag'] })
  groupBy?: ('date' | 'category' | 'merchant' | 'tag')[];

  @Prop({
    type: {
      field: String,
      order: { type: String, enum: ['asc', 'desc'] },
    },
  })
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };

  @Prop([
    {
      field: String,
      title: String,
      type: { type: String, enum: ['text', 'number', 'date', 'currency', 'boolean'] },
      format: String,
      width: Number,
    },
  ])
  columns!: Array<{
    field: string;
    title: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
    format?: string;
    width?: number;
  }>;

  @Prop({
    type: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      dayOfWeek: Number,
      dayOfMonth: Number,
      time: String,
      timezone: String,
      recipients: [String],
    },
  })
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    recipients: string[];
  };
}

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ReportTemplate' })
  templateId!: Types.ObjectId;

  @Prop({ required: true })
  generatedAt!: Date;

  @Prop({ required: true, enum: ['pending', 'processing', 'completed', 'failed'] })
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop()
  fileUrl?: string;

  @Prop()
  error?: string;

  @Prop()
  r2Key?: string;

  @Prop()
  downloadUrl?: string;

  @Prop()
  completedAt?: Date;
}

@Schema({ timestamps: true })
export class ReportSchedule {
  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ReportTemplate' })
  templateId!: Types.ObjectId;

  @Prop({ required: true, enum: ['scheduled', 'running', 'completed', 'failed'] })
  status!: 'scheduled' | 'running' | 'completed' | 'failed';

  @Prop({ required: true })
  nextRunAt!: Date;

  @Prop()
  lastRunAt?: Date;

  @Prop()
  error?: string;
}

export const ReportTemplateSchema = SchemaFactory.createForClass(ReportTemplate);
export const ReportSchema = SchemaFactory.createForClass(Report);
export const ReportScheduleSchema = SchemaFactory.createForClass(ReportSchedule);
