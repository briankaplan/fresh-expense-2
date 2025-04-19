import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';

/**
 * Service for managing OAuth2 tokens and authentication with Google APIs
 */
@Injectable()
export class TokenManagerService {
  private readonly logger = new Logger(TokenManagerService.name);
  private readonly oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing required Google OAuth2 configuration');
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.logger.debug('OAuth2 client initialized');
  }

  /**
   * Gets a new refresh token using the existing refresh token
   * @returns Promise containing the new refresh token
   * @throws Error if the token refresh fails
   */
  async getNewRefreshToken(): Promise<string> {
    try {
      this.logger.debug('Getting new refresh token');
      const refreshToken = this.oauth2Client.credentials.refresh_token;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { tokens } = await this.oauth2Client.getToken(refreshToken);
      if (!tokens.refresh_token) {
        throw new Error('No refresh token in response');
      }

      this.oauth2Client.setCredentials(tokens);
      this.logger.debug('Successfully obtained new refresh token');
      return tokens.refresh_token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to get new refresh token: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new Error(`Failed to get new refresh token: ${errorMessage}`);
    }
  }

  /**
   * Refreshes the access token using the refresh token
   * @returns Promise containing the new access token
   * @throws Error if the token refresh fails
   */
  async refreshAccessToken(): Promise<string> {
    try {
      this.logger.debug('Refreshing access token');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error('No access token in response');
      }

      this.oauth2Client.setCredentials(credentials);
      this.logger.debug('Successfully refreshed access token');
      return credentials.access_token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to refresh access token: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new Error(`Failed to refresh access token: ${errorMessage}`);
    }
  }

  /**
   * Sets the OAuth2 tokens for the client
   * @param accessToken - The access token to set
   * @param refreshToken - The refresh token to set
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.logger.debug('Setting new OAuth2 tokens');
    const credentials: Credentials = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    this.oauth2Client.setCredentials(credentials);
    this.logger.debug('Successfully set new OAuth2 tokens');
  }

  /**
   * Gets the OAuth2 client instance
   * @returns The OAuth2 client instance
   */
  getOAuth2Client(): OAuth2Client {
    return this.oauth2Client;
  }
}
