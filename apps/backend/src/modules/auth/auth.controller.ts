import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class LoginDto {
  email: string;
  password: string;
}


export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  
  
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
