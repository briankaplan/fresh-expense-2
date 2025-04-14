import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1, Auth } from 'googleapis';
import { TokenManagerService } from './token-manager.service';
import { RateLimiter } from 'limiter';
import { retry } from 'ts-retry-promise';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GoogleService } from './google.service';

interface SearchCriteria {
  dateRange?: {
    after: string;
    before: string;
  };
  from?: string[];
  subject?: string[];
  body?: string[];
  merchant?: string;
  amount?: number;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  account: string;
}

interface GoogleApiError extends Error {
  response?: {
    status: number;
  };
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType: string;
  body: {
    data?: string;
  };
}

interface GmailMessagePayload {
  headers: GmailMessageHeader[];
  parts?: GmailMessagePart[];
  body?: {
    data?: string;
  };
}

interface GmailMessage {
  id: string;
  payload: GmailMessagePayload;
}

interface GmailMessageListResponse {
  data: {
    messages?: Array<{
      id: string;
      threadId: string;
    }>;
  };
}

interface SearchProgress {
  account: string;
  total: number;
  processed: number;
  status: 'searching' | 'processing' | 'completed' | 'error';
  error?: string;
}

@Injectable()
export class GmailService extends GoogleService implements OnModuleInit {
  protected readonly logger = new Logger(GmailService.name);
  private readonly progressMap = new Map<string, SearchProgress>();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly tokenManager: TokenManagerService,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(configService, tokenManager, eventEmitter);
  }

  async onModuleInit() {
    await this.init();
  }

  async init() {
    if (this.accounts.size === 0) {
      this.logger.warn('No Google accounts configured for Gmail service');
      return;
    }
    this.logger.log('Gmail service initialized');
  }

  private async withRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return retry(fn, {
      retries: this.MAX_RETRIES,
      delay: this.RETRY_DELAY,
      backoff: 'LINEAR',
    });
  }

  private updateProgress(account: string, progress: Partial<SearchProgress>) {
    const current = this.progressMap.get(account) || {
      account,
      total: 0,
      processed: 0,
      status: 'searching',
    };
    this.progressMap.set(account, { ...current, ...progress });
    this.eventEmitter.emit('gmail.search.progress', this.progressMap.get(account));
  }

  async searchEmails(query: string, maxResults: number = 10): Promise<gmail_v1.Schema$Message[]> {
    return this.withAuth('kaplan.brian@gmail.com', async (oauth2Client) => {
      const gmail = google.gmail('v1');
      gmail.context._options.auth = oauth2Client;
      
      return this.withRateLimit(async () => {
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults,
        });
        
        if (!response.data.messages) {
          return [];
        }

        const messages = await Promise.all(
          response.data.messages.map(async (message: gmail_v1.Schema$Message) => {
            const fullMessage = await gmail.users.messages.get({
              userId: 'me',
              id: message.id!,
            });
            return fullMessage.data as gmail_v1.Schema$Message;
          })
        );

        return messages;
      });
    });
  }

  private buildSearchQuery(criteria: SearchCriteria): string {
    const queryParts: string[] = [];

    if (criteria.dateRange) {
      queryParts.push(`after:${criteria.dateRange.after}`);
      queryParts.push(`before:${criteria.dateRange.before}`);
    }

    if (criteria.from?.length) {
      queryParts.push(`from:(${criteria.from.join(' OR ')})`);
    }

    if (criteria.subject?.length) {
      queryParts.push(`subject:(${criteria.subject.join(' OR ')})`);
    }

    if (criteria.body?.length) {
      queryParts.push(`(${criteria.body.join(' OR ')})`);
    }

    if (criteria.merchant) {
      queryParts.push(`"${criteria.merchant}"`);
    }

    if (criteria.amount) {
      queryParts.push(`$${criteria.amount}`);
    }

    return queryParts.join(' ');
  }

  private parseMessageDetails(
    messageData: GmailMessage,
    accountEmail: string
  ): EmailMessage | null {
    if (!messageData.payload) {
      return null;
    }

    const headers = messageData.payload.headers || [];
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const date = new Date(headers.find(h => h.name.toLowerCase() === 'date')?.value || '');

    let body = '';
    if (messageData.payload.parts) {
      for (const part of messageData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    } else if (messageData.payload.body?.data) {
      body = Buffer.from(messageData.payload.body.data, 'base64').toString('utf-8');
    }

    return {
      id: messageData.id,
      subject,
      from,
      date,
      body,
      account: accountEmail,
    };
  }
} 