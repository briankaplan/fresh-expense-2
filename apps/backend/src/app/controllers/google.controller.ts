import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { GoogleService } from '../services/google.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('google')
@UseGuards(AuthGuard)
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('auth-url')
  async getAuthUrl(@Query('email') email: string) {
    try {
      const url = await this.googleService.getAuthUrl(email);
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('auth-callback')
  async handleAuthCallback(@Body('email') email: string, @Body('code') code: string) {
    try {
      const tokens = await this.googleService.handleAuthCallback(email, code);
      return { success: true, tokens };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('receipts')
  async searchReceipts(@Query('email') email: string, @Query('query') query: string) {
    try {
      const messages = await this.googleService.searchGmailReceipts(email, query);
      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('photos')
  async searchPhotos(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    try {
      const photos = await this.googleService.searchPhotos(new Date(startDate), new Date(endDate));
      return { success: true, photos };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
