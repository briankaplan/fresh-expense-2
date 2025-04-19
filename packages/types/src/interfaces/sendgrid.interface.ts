export enum SendGridStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface SendGridMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  status: SendGridStatus;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
    disposition: string;
  }>;
  parsedData?: {
    merchant?: string;
    amount?: number;
    date?: Date;
    items?: string[];
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendGrid extends SendGridMessage {}
