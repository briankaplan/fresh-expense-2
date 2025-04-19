import type { Document } from "mongoose";

export interface TwilioMetadata {
  from?: string;
  to?: string;
  body?: string;
  date?: Date;
  [key: string]: any;
}

export interface TwilioProcessing {
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface TwilioDocument extends Document {
  userId?: string;
  messageId?: string;
  status?: string;
  metadata?: TwilioMetadata;
  processing?: TwilioProcessing;
  tags?: string[];
}
