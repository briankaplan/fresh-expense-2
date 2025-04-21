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

import type { GoogleService } from "./services/google.service";
import type { TokenManagerService } from "./services/token-manager.service";
import { AuthGuard } from "../auth/guards/auth.guard";

interface GoogleResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly tokenManager: TokenManagerService,
  ) {}

  async connectGoogleAccount(@Body("code") code: string): Promise<GoogleResponse<void>> {
    try {
      await this.tokenManager.getNewRefreshToken();
      return {
        success: true,
        message: "Google account connected successfully",
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("An unknown error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchReceipts(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): Promise<GoogleResponse<any[]>> {
    try {
      const receipts = await this.googleService.searchGmailReceipts(
        `subject:receipt after:${startDate} before:${endDate}`,
      );
      return { success: true, data: receipts };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("An unknown error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchPhotos(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): Promise<GoogleResponse<any[]>> {
    try {
      const photos = await this.googleService.searchPhotos(new Date(startDate), new Date(endDate));
      return { success: true, data: photos };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("An unknown error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async syncGoogleData(): Promise<GoogleResponse<{ receipts: number; photos: number }>> {
    try {
      const [receipts, photos] = await Promise.all([
        this.googleService.searchGmailReceipts("subject:receipt"),
        this.googleService.searchPhotos(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          new Date(),
        ),
      ]);

      return {
        success: true,
        data: {
          receipts: receipts.length,
          photos: photos.length,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("An unknown error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
