import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import type { UsersService } from "../users/users.service";
import type { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async login(@Body() loginDto: LoginDto) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    const user = await this.usersService.findByEmail(loginDto.email);

    // Return both tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(@Body() registerDto: RegisterDto) {
    const { user, accessToken, refreshToken } = await this.authService.register(registerDto);

    // Return tokens and user data
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshToken(@Request() req) {
    const { refreshToken } = req.body;
    return this.authService.refreshToken(refreshToken);
  }

  async logout(@Request() req) {
    const { userId } = req.user;
    await this.authService.logout(userId);
    return { success: true };
  }
}
