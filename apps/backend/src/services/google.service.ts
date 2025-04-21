import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { type gmail_v1, google } from "googleapis";

import type { TokenManagerService } from "./token-manager.service";

interface GooglePhotoMediaItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
  };
  filename: string;
}

/**
 * Service for interacting with Google APIs (Gmail and Photos)
 */
@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private readonly gmail: gmail_v1.Gmail;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenManager: TokenManagerService,
  ) {
    this.gmail = google.gmail({ version: "v1" });
  }

  /**
   * Searches Gmail for receipt messages matching the given query
   * @param query - The search query to use
   * @returns Promise containing an array of Gmail messages
   * @throws Error if the search fails
   */
  async searchGmailReceipts(query: string): Promise<gmail_v1.Schema$Message[]> {
    try {
      this.logger.debug(`Searching Gmail for receipts with query: ${query}`);
      const auth = this.tokenManager.getOAuth2Client();
      const response = await this.gmail.users.messages.list({
        auth,
        userId: "me",
        q: query,
      });

      const messages = response.data.messages || [];
      this.logger.debug(`Found ${messages.length} receipt messages`);
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to search Gmail receipts: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to search Gmail receipts: ${errorMessage}`);
    }
  }

  /**
   * Searches Google Photos for media items within the specified date range
   * @param startDate - The start date for the search
   * @param endDate - The end date for the search
   * @returns Promise containing an array of media items
   * @throws Error if the search fails
   */
  async searchPhotos(startDate: Date, endDate: Date): Promise<GooglePhotoMediaItem[]> {
    try {
      this.logger.debug(
        `Searching Google Photos from ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );
      const auth = this.tokenManager.getOAuth2Client();

      const response = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.credentials.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            dateFilter: {
              ranges: [
                {
                  startDate: {
                    year: startDate.getFullYear(),
                    month: startDate.getMonth() + 1,
                    day: startDate.getDate(),
                  },
                  endDate: {
                    year: endDate.getFullYear(),
                    month: endDate.getMonth() + 1,
                    day: endDate.getDate(),
                  },
                },
              ],
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Photos API error: ${errorData.error?.message || "Unknown error"}`);
      }

      const data = await response.json();
      const mediaItems = data.mediaItems || [];
      this.logger.debug(`Found ${mediaItems.length} photos`);
      return mediaItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to search Google Photos: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to search Google Photos: ${errorMessage}`);
    }
  }
}
