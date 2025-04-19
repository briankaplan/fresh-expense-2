import type { MetricType, Metrics } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class MetricsDocument extends Document implements Metrics {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ["income", "expense", "savings"] })
  type: MetricType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const MetricsSchema = SchemaFactory.createForClass(MetricsDocument);

export interface MetricsQueryParams {
  userId: string;
  type?: MetricType;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

export interface MetricsAggregation {
  total: number;
  average: number;
  count: number;
  min: number;
  max: number;
}

export interface MetricsTrend {
  _id: {
    year: number;
    month: number;
  };
  total: number;
  count: number;
}
