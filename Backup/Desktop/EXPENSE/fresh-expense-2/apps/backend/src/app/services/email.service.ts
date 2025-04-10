import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter, TransportOptions } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private emailConfig: any;

  constructor(configService: ConfigService) {
    this.emailConfig = configService.get('email');
    this.transporter = createTransport({
      host: this.emailConfig.transport.host,
      port: this.emailConfig.transport.port,
      secure: this.emailConfig.transport.secure,
      auth: {
        user: this.emailConfig.transport.auth.user,
        pass: this.emailConfig.transport.auth.pass,
      },
    } as TransportOptions);
  }

  async sendEmail(to: string, subject: string, text: string) {
    const from = this.emailConfig.transport.auth.user;
    await this.transporter.sendMail({ from, to, subject, text });
  }

  async searchEmails(criteria: any) {
    // Implement email search logic
    return [];
  }

  async extractReceipt(email: any) {
    // Implement receipt extraction logic
    return null;
  }
} 