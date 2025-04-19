import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { BaseService } from '../base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '../notification/notification.service';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  reportUrl?: string;
}

@Injectable()
export class EmailService extends BaseService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    notificationService: NotificationService,
    eventEmitter: EventEmitter2
  ) {
    super(notificationService, eventEmitter, EmailService.name);
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    return this.executeWithRetry('sendEmail', async () => {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('SMTP_FROM'),
          ...options,
        });
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error(String(error));
        this.logger.error(`Failed to send email: ${typedError.message}`);
        throw typedError;
      }
    });
  }

  async sendReportEmail(options: EmailOptions): Promise<void> {
    return this.executeWithRetry('sendReportEmail', async () => {
      try {
        const reportUrl = options.reportUrl;
        if (!reportUrl) {
          throw new Error('Report URL is required for report emails');
        }

        const html = `
          <h1>Report Available</h1>
          <p>Your report is ready. Click the link below to view it:</p>
          <a href="${reportUrl}">View Report</a>
        `;

        await this.transporter.sendMail({
          from: this.configService.get<string>('SMTP_FROM'),
          ...options,
          html,
        });
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error(String(error));
        this.logger.error(`Failed to send report email: ${typedError.message}`);
        throw typedError;
      }
    });
  }
}
