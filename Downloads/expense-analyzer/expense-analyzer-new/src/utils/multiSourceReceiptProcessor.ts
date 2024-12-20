'use client';

import { Dropbox } from 'dropbox';
import { Imap, ParsedMail, simpleParser } from 'imap-simple';
import { Twilio } from 'twilio';
import { ProcessedReceipt, ChaseTransaction } from '@/types';
import { Logger } from '@/utils/logger';
import { processReceipt } from '@/lib/mindee';
import { extractTextFromPDF } from '@/utils/pdfExtractor';

interface MultiSourceConfig {
  dropbox: {
    appKey: string;
    appSecret: string;
    accessToken: string;
    watchFolder: string;
    backupFolder: string;
  };
  email: {
    host: string;
    user: string;
    password: string;
    receiptFolder: string;
    processedFolder: string;
    allowedSenders?: string[];
  };
  sms: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  notifications?: {
    onNewReceipt?: (receipt: ProcessedReceipt) => Promise<void>;
    onMatch?: (match: ReceiptMatch) => Promise<void>;
    onError?: (error: Error) => Promise<void>;
  };
}

interface ReceiptSource {
  type: 'email' | 'sms' | 'dropbox';
  identifier: string;
  metadata?: Record<string, any>;
}

export class MultiSourceReceiptProcessor {
  private dbx: Dropbox;
  private imap: Imap.Connection;
  private twilio: Twilio;
  private isProcessing: boolean = false;

  constructor(private config: MultiSourceConfig) {
    // Initialize services
    this.dbx = new Dropbox({ accessToken: config.dropbox.accessToken });
    this.twilio = new Twilio(config.sms.accountSid, config.sms.authToken);
    this.initializeEmailConnection();
  }

  private async initializeEmailConnection() {
    this.imap = new Imap({
      user: this.config.email.user,
      password: this.config.email.password,
      host: this.config.email.host,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    this.imap.on('error', (err) => {
      Logger.error('IMAP connection error', { error: err });
    });
  }

  async startProcessing(): Promise<void> {
    try {
      // Start watching all sources
      await Promise.all([
        this.watchDropbox(),
        this.watchEmail(),
        this.setupSMSWebhook()
      ]);

      Logger.info('Started processing receipts from all sources');
    } catch (error) {
      Logger.error('Failed to start receipt processing', { error });
      throw error;
    }
  }

  private async watchEmail(): Promise<void> {
    await this.imap.connect();
    
    // Check for new emails every minute
    setInterval(async () => {
      if (this.isProcessing) return;
      
      try {
        this.isProcessing = true;
        await this.processNewEmails();
      } finally {
        this.isProcessing = false;
      }
    }, 60000);
  }

  private async processNewEmails(): Promise<void> {
    const box = await this.imap.openBox(this.config.email.receiptFolder);
    const searchCriteria = ['UNSEEN'];
    const emails = await this.imap.search(searchCriteria);

    for (const email of emails) {
      try {
        const parsed: ParsedMail = await simpleParser(email);
        
        // Validate sender if allowedSenders is configured
        if (this.config.email.allowedSenders?.length &&
            !this.config.email.allowedSenders.includes(parsed.from?.text || '')) {
          continue;
        }

        // Process attachments
        if (parsed.attachments?.length) {
          for (const attachment of parsed.attachments) {
            if (this.isValidAttachment(attachment)) {
              await this.processAttachment(attachment, {
                type: 'email',
                identifier: parsed.messageId || '',
                metadata: {
                  from: parsed.from?.text,
                  subject: parsed.subject,
                  date: parsed.date
                }
              });
            }
          }
        }

        // Check email body for embedded receipts or text content
        if (parsed.html) {
          const embeddedReceipt = await this.extractReceiptFromHtml(parsed.html);
          if (embeddedReceipt) {
            await this.processReceipt(embeddedReceipt, {
              type: 'email',
              identifier: parsed.messageId || '',
              metadata: { isEmbedded: true }
            });
          }
        }

        // Move to processed folder
        await this.imap.move(email.uid, this.config.email.processedFolder);
      } catch (error) {
        Logger.error('Failed to process email', { error, emailId: email.uid });
      }
    }
  }

  private async processSMSReceipt(message: any): Promise<void> {
    try {
      // Handle different types of SMS content
      if (message.NumMedia > 0) {
        // Process attached media
        for (let i = 0; i < message.NumMedia; i++) {
          const mediaUrl = message[`MediaUrl${i}`];
          const mediaType = message[`MediaContentType${i}`];
          
          if (this.isValidMediaType(mediaType)) {
            const response = await fetch(mediaUrl);
            const buffer = await response.arrayBuffer();
            await this.processAttachment(
              new Blob([buffer], { type: mediaType }),
              {
                type: 'sms',
                identifier: message.MessageSid,
                metadata: {
                  from: message.From,
                  date: new Date().toISOString()
                }
              }
            );
          }
        }
      } else {
        // Try to extract receipt information from text
        const receiptData = await this.extractReceiptFromText(message.Body);
        if (receiptData) {
          await this.processReceipt(receiptData, {
            type: 'sms',
            identifier: message.MessageSid
          });
        }
      }
    } catch (error) {
      Logger.error('Failed to process SMS receipt', { error, messageSid: message.MessageSid });
    }
  }

  private async extractReceiptFromHtml(html: string): Promise<any> {
    // Implement HTML parsing logic to find receipt data
    // This could use cheerio or other HTML parsing libraries
    // Return structured receipt data if found
    return null;
  }

  private async extractReceiptFromText(text: string): Promise<any> {
    // Implement text parsing logic to find receipt data
    // This could use regex or NLP to extract amounts, dates, merchants
    // Return structured receipt data if found
    return null;
  }

  private isValidAttachment(attachment: any): boolean {
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/heic'
    ];
    return validTypes.includes(attachment.contentType);
  }

  private isValidMediaType(mediaType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/heic',
      'application/pdf'
    ];
    return validTypes.includes(mediaType);
  }

  private async backupToDropbox(
    content: Buffer,
    filename: string,
    source: ReceiptSource
  ): Promise<string> {
    const path = `${this.config.dropbox.backupFolder}/${source.type}/${filename}`;
    await this.dbx.filesUpload({
      path,
      contents: content,
      mode: { '.tag': 'overwrite' }
    });
    return path;
  }

  private async processAttachment(
    attachment: any,
    source: ReceiptSource
  ): Promise<void> {
    // Convert attachment to proper format for OCR
    const file = new File(
      [attachment.content || attachment],
      attachment.filename || `receipt-${Date.now()}.${attachment.contentType.split('/')[1]}`
    );

    // Process with OCR
    const ocrResult = await processReceipt(file);

    // Backup to Dropbox
    const backupPath = await this.backupToDropbox(
      Buffer.from(await file.arrayBuffer()),
      file.name,
      source
    );

    // Create processed receipt record
    const processedReceipt: ProcessedReceipt = {
      id: `receipt-${Date.now()}`,
      originalSource: source,
      backupUrl: backupPath,
      ocrData: ocrResult,
      status: 'pending',
      processedAt: new Date()
    };

    // Notify of new receipt
    await this.config.notifications?.onNewReceipt?.(processedReceipt);
  }
}

// Usage example:
/*
const processor = new MultiSourceReceiptProcessor({
  dropbox: {
    appKey: process.env.DROPBOX_APP_KEY!,
    appSecret: process.env.DROPBOX_APP_SECRET!,
    accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
    watchFolder: '/Receipts/Inbox',
    backupFolder: '/Receipts/Processed'
  },
  email: {
    host: 'imap.gmail.com',
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASSWORD!,
    receiptFolder: 'Receipts',
    processedFolder: 'Receipts/Processed',
    allowedSenders: ['receipts@mycompany.com']
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!
  },
  notifications: {
    onNewReceipt: async (receipt) => {
      // Handle new receipt
    },
    onError: async (error) => {
      // Handle error
    }
  }
});

await processor.startProcessing();
*/ 