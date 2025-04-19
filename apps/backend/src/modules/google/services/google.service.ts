import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

@Injectable()
export class GoogleService {
  private readonly oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get("GOOGLE_CLIENT_ID"),
      this.configService.get("GOOGLE_CLIENT_SECRET"),
      this.configService.get("GOOGLE_REDIRECT_URI"),
    );
  }

  async searchGmailReceipts(query: string): Promise<any[]> {
    try {
      const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
      });

      const messages = response.data.messages || [];
      const receipts = await Promise.all(
        messages.map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });
          return details.data;
        }),
      );

      return receipts;
    } catch (error) {
      throw new Error(`Failed to search Gmail receipts: ${error.message}`);
    }
  }

  async searchPhotos(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const photos = google.photoslibrary({
        version: "v1",
        auth: this.oauth2Client,
      });
      const response = await photos.mediaItems.search({
        requestBody: {
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
        },
      });

      return response.data.mediaItems || [];
    } catch (error) {
      throw new Error(`Failed to search Google Photos: ${error.message}`);
    }
  }
}
