import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export class Migration {
  @Prop({ required: true, unique: true })
  version: number;

  @Prop({ required: true })
  appliedAt: Date;

  @Prop({ required: true, enum: ["pending", "completed", "failed"] })
  status: string;

  @Prop()
  error?: string;

  @Prop()
  duration?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MigrationSchema = SchemaFactory.createForClass(Migration);

// Create indexes
MigrationSchema.index({ version: 1 }, { unique: true });
MigrationSchema.index({ appliedAt: 1 });
MigrationSchema.index({ status: 1 });
