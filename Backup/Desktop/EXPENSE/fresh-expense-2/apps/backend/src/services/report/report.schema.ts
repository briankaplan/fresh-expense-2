import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReportFormat = 'pdf' | 'csv' | 'excel';
export type ReportType = 'receipt' | 'expense';
export type ReportStatus = 'running' | 'completed' | 'failed' | 'scheduled';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

@Schema({ timestamps: true })
export class ReportTemplate extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['receipt', 'expense'] })
  type: ReportType;

  @Prop({ required: true, enum: ['pdf', 'csv', 'excel'] })
  format: ReportFormat;

  @Prop({ type: Object })
  customization: {
    headers?: string[];
    groupBy?: string[];
    sortBy?: string[];
    filters?: Record<string, any>;
    template?: string;
  };

  @Prop({ type: Object })
  scheduling?: {
    frequency?: ReportFrequency;
    recipients?: string[];
    nextRun?: Date;
  };
}

@Schema({ timestamps: true })
export class ReportSchedule extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['daily', 'weekly', 'monthly'] })
  frequency: ReportFrequency;

  @Prop({ type: [String] })
  recipients: string[];

  @Prop({ type: Date })
  nextRun: Date;

  @Prop({ type: Date })
  lastRun: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, enum: ['scheduled', 'paused'] })
  status: string;
}

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['running', 'completed', 'failed'] })
  status: ReportStatus;

  @Prop({ type: String })
  error?: string;

  @Prop({ type: String })
  r2Key?: string;

  @Prop({ type: String })
  downloadUrl?: string;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const ReportTemplateSchema = SchemaFactory.createForClass(ReportTemplate);
export const ReportScheduleSchema = SchemaFactory.createForClass(ReportSchedule);
export const ReportSchema = SchemaFactory.createForClass(Report); 