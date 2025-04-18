import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User } from '../../app/models/user.model';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { EmailService } from '../../services/email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await argon2.verify(user.password, password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    await user.save();

    const { password, ...result } = user.toObject();
    return result;
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findByIdAndUpdate(
        payload.userId,
        { isEmailVerified: true },
        { new: true }
      );
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: resetPasswordDto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(resetPasswordDto.newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.password, changePasswordDto.currentPassword);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async refreshToken(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async updateUser(userId: string, updateUserDto: any) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async findUserById(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async updatePassword(userId: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async findUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }
}
