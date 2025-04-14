import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { GoogleService } from '../services/google.service';
import { TokenManagerService } from '../services/token-manager.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('google')
@UseGuards(AuthGuard)
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly tokenManager: TokenManagerService
  ) {}

  @Post('connect')
  async connectGoogleAccount(@Body() body: { code: string }) {
    try {
      const response = await this.tokenManager.getNewRefreshToken();
      return { success: true, message: 'Google account connected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('receipts')
  async searchReceipts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const receipts = await this.googleService.searchGmailReceipts(
        `subject:receipt after:${startDate} before:${endDate}`
      );
      return { success: true, receipts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('photos')
  async searchPhotos(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const photos = await this.googleService.searchPhotos(
        new Date(startDate),
        new Date(endDate)
      );
      return { success: true, photos };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('sync')
  async syncGoogleData() {
    try {
      // Sync both Gmail and Photos
      const [receipts, photos] = await Promise.all([
        this.googleService.searchGmailReceipts('subject:receipt'),
        this.googleService.searchPhotos(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          new Date()
        ),
      ]);

      return {
        success: true,
        receipts: receipts.length,
        photos: photos.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 