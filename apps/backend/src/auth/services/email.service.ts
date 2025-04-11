import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { User } from '../types/user.type';

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

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '24h' },
    );

    const verificationLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to Fresh Expense!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(user: User): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '1h' },
    );

    const resetLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
} 