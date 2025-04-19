import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

export type SmsDocument = Sms & Document;

@Schema({ timestamps: true })
export class Sms {
  @Prop({ type: String })
  userId?: string;

  @Prop({ type: String })
  messageId?: string;

  @Prop({ type: String })
  status?: string;

  @Prop({ type: Object })
  metadata?: {
    from?: string;
    to?: string;
    body?: string;
    date?: Date;
    [key: string]: any;
  };

  @Prop({ type: Object })
  processing?: {
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
  };

  @Prop({ type: [String], default: [] })
  tags?: string[];
}

export const SmsSchema = SchemaFactory.createForClass(Sms);

// Add indexes
SmsSchema.index({ userId: 1, status: 1 });
SmsSchema.index({ createdAt: -1 });
SmsSchema.index({ "metadata.date": 1 });
SmsSchema.index({ "metadata.from": 1 });
SmsSchema.index({ "metadata.to": 1 });
SmsSchema.index({ tags: 1 });
