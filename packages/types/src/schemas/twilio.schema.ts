import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from './base.schema';

export type TwilioDocument = Twilio & Document;

@Schema({ timestamps: true })
export class Twilio extends BaseDocument {
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

  constructor(partial: Partial<Twilio>) {
    super();
    Object.assign(this, partial);
  }
}

export const TwilioSchema = SchemaFactory.createForClass(Twilio);

// Add indexes
TwilioSchema.index({ userId: 1, status: 1 });
TwilioSchema.index({ createdAt: -1 });
TwilioSchema.index({ 'metadata.date': 1 });
TwilioSchema.index({ 'metadata.from': 1 });
TwilioSchema.index({ 'metadata.to': 1 });
TwilioSchema.index({ tags: 1 }); 