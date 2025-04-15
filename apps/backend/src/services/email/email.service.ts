import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
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
    try {
      const from = this.configService.get<string>('SMTP_FROM');
      await this.transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendReportEmail(options: EmailOptions): Promise<void> {
    try {
      const html = `
        <h2>Your Report is Ready</h2>
        <p>Your requested report has been generated and is now available for download.</p>
        <p>You can access your report using the following link:</p>
        <p><a href="${options.reportUrl}">Download Report</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>Your Expense App Team</p>
      `;

      await this.sendEmail({
        ...options,
        html,
      });
    } catch (error) {
      this.logger.error('Error sending report email:', error);
      throw error;
    }
  }
}
