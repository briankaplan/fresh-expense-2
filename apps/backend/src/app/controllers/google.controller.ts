import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";

import type { GoogleService } from "../services/google.service";

import { AuthGuard } from "@/modules/auth/auth.guard";

export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  async getAuthUrl(@Query("email") email: string) {
    try {
      const url = await this.googleService.getAuthUrl(email);
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleAuthCallback(@Body("email") email: string, @Body("code") code: string) {
    try {
      const tokens = await this.googleService.handleAuthCallback(email, code);
      return { success: true, tokens };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchReceipts(@Query("email") email: string, @Query("query") query: string) {
    try {
      const messages = await this.googleService.searchGmailReceipts(email, query);
      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchPhotos(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    try {
      const photos = await this.googleService.searchPhotos(new Date(startDate), new Date(endDate));
      return { success: true, photos };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
