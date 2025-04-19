import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { UserDocument } from '@fresh-expense/types';

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await argon2.hash(dto.password);

    // Create user
    const user = await this.userModel.create({
      ...dto,
      password: hashedPassword,
      lastLoginAt: new Date(),
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    // Find user
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
