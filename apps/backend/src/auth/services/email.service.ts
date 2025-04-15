import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../types/user.type';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateVerificationLink,
  generatePasswordResetLink,
  generateVerificationEmailContent,
  generatePasswordResetEmailContent,
} from '@packages/utils';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured');
    }

    const frontendUrl = this.configService.get('FRONTEND_URL');

    // Use utility functions instead of inline code
    const token = generateEmailVerificationToken(user.id, jwtSecret);
    const verificationLink = generateVerificationLink(frontendUrl, token);
    const emailContent = generateVerificationEmailContent(verificationLink);

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: 'Verify your email',
      html: emailContent,
    });
  }

  async sendPasswordResetEmail(user: User): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured');
    }

    const frontendUrl = this.configService.get('FRONTEND_URL');

    // Use utility functions instead of inline code
    const token = generatePasswordResetToken(user.id, jwtSecret);
    const resetLink = generatePasswordResetLink(frontendUrl, token);
    const emailContent = generatePasswordResetEmailContent(resetLink);

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: 'Reset your password',
      html: emailContent,
    });
  }
}
