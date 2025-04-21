import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";

import type { ChangePasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from "../dto/auth.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import type { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  async verifyEmail(@Param("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  async forgotPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.initiatePasswordReset(resetPasswordDto);
  }

  async resetPassword(@Param("token") token: string, @Body("newPassword") newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  async refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
