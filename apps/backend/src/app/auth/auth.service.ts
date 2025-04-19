import type { UserDocument } from "@fresh-expense/types";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import type { Request, Response } from "express";
import type { UsersService } from "../users/users.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(user.password, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async handleGoogleCallback(req: Request, res: Response) {
    const user = req.user as UserDocument;
    const tokens = await this.generateTokens(user);

    // Set cookies or redirect as needed
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>("NODE_ENV") === "production",
    });

    res.redirect("/dashboard");
  }

  async getProfile(user: UserDocument) {
    return this.usersService.findById(user._id.toString());
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    // In a real application, you might want to invalidate the refresh token
    return { message: "Logged out successfully" };
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId, true);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
    });
  }

  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
