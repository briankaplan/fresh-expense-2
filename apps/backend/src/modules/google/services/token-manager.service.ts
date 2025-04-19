import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

@Injectable()
export class TokenManagerService {
  private readonly oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get("GOOGLE_CLIENT_ID"),
      this.configService.get("GOOGLE_CLIENT_SECRET"),
      this.configService.get("GOOGLE_REDIRECT_URI"),
    );
  }

  async getNewRefreshToken(): Promise<string> {
    try {
      const { tokens } = await this.oauth2Client.getToken(
        this.oauth2Client.credentials.refresh_token,
      );
      this.oauth2Client.setCredentials(tokens);
      return tokens.refresh_token;
    } catch (error) {
      throw new Error(`Failed to get new refresh token: ${error.message}`);
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials.access_token;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}
