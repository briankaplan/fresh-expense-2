import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { TokenManagerService } from './token-manager.service';

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

@Injectable()
export class GmailService implements OnModuleInit {
  private readonly logger = new Logger(GmailService.name);
  private initialized = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenManager: TokenManagerService,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  async init() {
    if (this.initialized) return;

    try {
      // Verify we can get tokens for all accounts
      const accounts = this.tokenManager.getEmailAccounts();
      for (const email of accounts) {
        const token = await this.tokenManager.getGmailAccessToken(email);
        if (!token) {
          throw new Error(`Failed to get token for ${email}`);
        }
      }

      this.initialized = true;
      this.logger.log('Gmail service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Gmail service:', error);
      throw error;
    }
  }

  async searchEmails(criteria: SearchCriteria, accountEmail?: string): Promise<EmailMessage[]> {
    const results: EmailMessage[] = [];
    const errors: Array<{ account: string; error: string }> = [];

    // Get accounts to search
    let accountsToSearch = this.tokenManager.getEmailAccounts();
    if (accountEmail) {
      if (!accountsToSearch.includes(accountEmail)) {
        throw new Error(`Invalid account email: ${accountEmail}`);
      }
      accountsToSearch = [accountEmail];
    }

    // Search filtered accounts in parallel
    const searchPromises = accountsToSearch.map(async (email) => {
      let retryCount = 0;
      while (retryCount < this.MAX_RETRIES) {
        try {
          this.logger.debug(`Searching account: ${email}`);
          
          // Get fresh token
          const accessToken = await this.tokenManager.getGmailAccessToken(email);
          if (!accessToken) {
            throw new Error(`Failed to get access token for ${email}`);
          }

          const gmail = google.gmail({ 
            version: 'v1',
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          // Build search query
          const searchQuery = this.buildSearchQuery(criteria);
          this.logger.debug(`Search query: ${searchQuery}`);

          // Search messages
          const response = await gmail.users.messages.list({
            userId: 'me',
            q: searchQuery,
            maxResults: 10 // Limit results for performance
          });

          if (!response.data.messages) {
            this.logger.debug(`No messages found for ${email}`);
            return;
          }

          // Fetch message details in parallel
          const messagePromises = response.data.messages.map(async (message) => {
            const details = await gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full'
            });

            return this.parseMessageDetails(details.data, email);
          });

          const messages = await Promise.all(messagePromises);
          results.push(...messages);
          break; // Success, exit retry loop

        } catch (error) {
          retryCount++;
          const apiError = error as GoogleApiError;
          this.logger.error(
            `Error searching account ${email} (attempt ${retryCount}/${this.MAX_RETRIES}):`,
            apiError
          );
          
          if (apiError.response?.status === 401) {
            // Token expired, clear cache and retry
            this.tokenManager.clearTokenCache(email);
            if (retryCount < this.MAX_RETRIES) {
              await new Promise(resolve => 
                setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, retryCount))
              );
              continue;
            }
          }
          
          if (retryCount === this.MAX_RETRIES) {
            errors.push({ account: email, error: apiError.message });
          } else {
            await new Promise(resolve => 
              setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, retryCount))
            );
          }
        }
      }
    });

    await Promise.all(searchPromises);

    if (errors.length > 0) {
      this.logger.warn('Search completed with errors:', errors);
    }

    return results;
  }

  private buildSearchQuery(criteria: SearchCriteria): string {
    const searchQuery: string[] = [];
    
    // Add date range
    if (criteria.dateRange) {
      searchQuery.push(`after:${criteria.dateRange.after}`);
      searchQuery.push(`before:${criteria.dateRange.before}`);
    }
    
    // Handle email senders
    if (criteria.from?.length) {
      const fromQuery = criteria.from.map(from => `from:${from}`).join(' OR ');
      searchQuery.push(`(${fromQuery})`);
    }
    
    // Handle subject terms
    if (criteria.subject?.length) {
      const subjectQuery = criteria.subject
        .map(subject => `subject:"${subject}"`)
        .join(' OR ');
      searchQuery.push(`(${subjectQuery})`);
    }
    
    // Handle body terms
    if (criteria.body?.length) {
      const bodyQuery = criteria.body
        .map(term => `"${term}"`)
        .join(' OR ');
      searchQuery.push(`(${bodyQuery})`);
    }
    
    // Handle merchant search
    if (criteria.merchant) {
      searchQuery.push(
        `(subject:"${criteria.merchant}" OR from:"${criteria.merchant}")`
      );
    }
    
    // Add amount to search
    if (criteria.amount) {
      // For DoorDash, look for both Total and Estimated Total
      if (criteria.from?.includes('no-reply@doordash.com')) {
        searchQuery.push(
          `("Total: $${criteria.amount}" OR "Estimated Total: $${criteria.amount}")`
        );
      } else {
        searchQuery.push(`"$${criteria.amount}"`);
      }
    }
    
    return searchQuery.join(' ');
  }

  private parseMessageDetails(
    messageData: any,
    accountEmail: string
  ): EmailMessage {
    const headers = messageData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    // Get message body
    let body = '';
    if (messageData.payload.parts) {
      const textPart = messageData.payload.parts.find(
        part => part.mimeType === 'text/plain'
      );
      if (textPart?.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (messageData.payload.body.data) {
      body = Buffer.from(messageData.payload.body.data, 'base64').toString();
    }

    return {
      id: messageData.id,
      subject,
      from,
      date: new Date(date),
      body,
      account: accountEmail
    };
  }
} 