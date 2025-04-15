import { Controller, Post, Body, Get, UseGuards, Req, Param, Put } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.initiatePasswordReset(resetPasswordDto);
  }

  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
