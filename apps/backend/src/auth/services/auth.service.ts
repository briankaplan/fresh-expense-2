import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
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

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    return {
      user,
      accessToken: this.jwtService.sign({ sub: user._id }),
      refreshToken: this.jwtService.sign(
        { sub: user._id },
        { expiresIn: '7d' },
      ),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      isEmailVerified: false,
    });

    await this.emailService.sendVerificationEmail(user);

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

  async initiatePasswordReset(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: resetPasswordDto.email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: '1h' },
    );

    await this.emailService.sendPasswordResetEmail(user, resetToken);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const user = await this.userModel.findByIdAndUpdate(
        payload.userId,
        { password: hashedPassword },
        { new: true }
      );

      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        accessToken: this.jwtService.sign({ sub: user._id }),
        refreshToken: this.jwtService.sign(
          { sub: user._id },
          { expiresIn: '7d' },
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateUser(userId: string, updateUserDto: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true }
    );
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    const { password, ...result } = updatedUser.toObject();
    return result;
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