import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginDto, RegisterDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    return {
      user,
      accessToken: this.jwtService.sign({ sub: user.id }),
      refreshToken: this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      ),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        isEmailVerified: false,
      },
    });

    await this.emailService.sendVerificationEmail(user);

    const { password, ...result } = user;
    return result;
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.update({
        where: { id: payload.userId },
        data: { isEmailVerified: true },
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async initiatePasswordReset(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.emailService.sendPasswordResetEmail(user);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const user = await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValidPassword = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        accessToken: this.jwtService.sign({ sub: user.id }),
        refreshToken: this.jwtService.sign(
          { sub: user.id },
          { expiresIn: '7d' },
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 