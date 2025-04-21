import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../modules/auth/guards/auth.guard";
import type { GoogleService } from "../services/google.service";
import type { TokenManagerService } from "../services/token-manager.service";

interface GoogleResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

@Controller("google")
@UseGuards(AuthGuard)
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly tokenManager: TokenManagerService,
  ) {}

  @Post("connect")
  async connectGoogleAccount(@Body("code") code: string): Promise<GoogleResponse<void>> {
    try {
      await this.tokenManager.getNewRefreshToken();
      return {
        success: true,
        message: "Google account connected successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect Google account";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("receipts")
  async searchReceipts(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): Promise<GoogleResponse<any[]>> {
    try {
      const query = `subject:receipt after:${startDate} before:${endDate}`;
      const receipts = await this.googleService.searchGmailReceipts(query);
      return { success: true, data: receipts };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to search receipts";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("photos")
  async searchPhotos(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): Promise<GoogleResponse<any[]>> {
    try {
      const photos = await this.googleService.searchPhotos(new Date(startDate), new Date(endDate));
      return { success: true, data: photos };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to search photos";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("sync")
  async syncGoogleData(): Promise<GoogleResponse<{ receipts: number; photos: number }>> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const [receipts, photos] = await Promise.all([
        this.googleService.searchGmailReceipts("subject:receipt"),
        this.googleService.searchPhotos(thirtyDaysAgo, now),
      ]);

      return {
        success: true,
        data: { receipts: receipts.length, photos: photos.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync Google data";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
