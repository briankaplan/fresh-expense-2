import type { Document } from "mongoose";

export interface SmsMetadata {
  from?: string;
  to?: string;
  body?: string;
  date?: Date;
  [key: string]: any;
}

export interface SmsProcessing {
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface SmsDocument extends Document {
  userId?: string;
  messageId?: string;
  status?: string;
  metadata?: SmsMetadata;
  processing?: SmsProcessing;
  tags?: string[];
}
