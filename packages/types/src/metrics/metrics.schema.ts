import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

import type { BaseDocument } from "../schemas/base.schema";

export type MetricsDocument = Metrics & Document;

@Schema({ timestamps: true })
export class Metrics implements BaseDocument {
  @Prop({ type: String, required: true })
  public _id!: string;

  @Prop({ type: Date, required: true })
  public createdAt!: Date;

  @Prop({ type: Date, required: true })
  public updatedAt!: Date;

  @Prop({ type: Date })
  public deletedAt?: Date;

  @Prop({ type: Boolean, default: false, required: true })
  public isDeleted!: boolean;

  @Prop({ required: true, index: true })
  public userId!: string;

  @Prop({ required: true })
  public type!: string;

  @Prop({ required: true })
  public value!: number;

  @Prop({ required: true })
  public date!: Date;

  @Prop({ type: Object })
  public metadata?: Record<string, unknown>;

  constructor(partial: Partial<Metrics>) {
    Object.assign(this, partial);
  }
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);

// Indexes
MetricsSchema.index({ userId: 1, type: 1 });
MetricsSchema.index({ userId: 1, date: -1 });
MetricsSchema.index({ type: 1, date: -1 });
