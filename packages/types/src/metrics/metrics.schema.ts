import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from '../schemas/base.schema';

export type MetricsDocument = Metrics & Document;

@Schema({ timestamps: true })
export class Metrics implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Metrics>) {
    Object.assign(this, partial);
  }
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);

// Indexes
MetricsSchema.index({ userId: 1, type: 1 });
MetricsSchema.index({ userId: 1, date: -1 });
MetricsSchema.index({ type: 1, date: -1 });
