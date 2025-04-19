import { MetricType, Metrics } from "@fresh-expense/types";
import type { BaseDocument } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

export type MetricsDocument = MetricsModel & Document;

@Schema({ timestamps: true })
export class MetricsModel implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true })
  userId!: string;

  @Prop({
    required: true,
    enum: Object.values(MetricType),
  })
  type!: MetricType;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true })
  period!: string;

  @Prop({ type: Object })
  metrics!: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  constructor(partial: Partial<MetricsModel>) {
    Object.assign(this, partial);
  }
}

export const MetricsSchema = SchemaFactory.createForClass(MetricsModel);

// Create indexes for common queries
MetricsSchema.index({ userId: 1, type: 1 });
MetricsSchema.index({ userId: 1, timestamp: 1 });
MetricsSchema.index({ userId: 1, "metadata.category": 1 });
MetricsSchema.index({ userId: 1, "metadata.merchant": 1 });
MetricsSchema.index({ userId: 1, "metadata.period": 1 });
