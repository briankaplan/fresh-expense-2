import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { type Auth, google } from "googleapis";
import { RateLimiter } from "limiter";
import type { TokenManagerService } from "./token-manager.service";

export interface GoogleAccount {
  email: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  scopes: string[];
  oauth2Client: Auth.OAuth2Client;
  credentials?: Auth.Credentials;
}

@Injectable()
export class GoogleService {
  protected readonly logger = new Logger(GoogleService.name);
  protected readonly accounts: Map<string, GoogleAccount> = new Map();
  protected readonly scopes: string[] = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/photoslibrary.readonly",
  ];
  protected readonly rateLimiter: RateLimiter;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly tokenManager: TokenManagerService,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: "second",
    });
    this.initializeAccounts();
  }

  protected initializeAccounts() {
    const accounts = this.configService.get("GOOGLE_ACCOUNTS");
    if (!accounts) {
      this.logger.warn("No Google accounts configured");
      return;
    }

    for (const account of accounts) {
      const oauth2Client = new google.auth.OAuth2(
        account.clientId,
        account.clientSecret,
        this.configService.get("GOOGLE_REDIRECT_URI"),
      );

      this.accounts.set(account.email, {
        ...account,
        oauth2Client,
        scopes: this.scopes,
      });
    }
  }

  protected async getAccount(email: string): Promise<GoogleAccount> {
    const account = this.accounts.get(email);
    if (!account) {
      throw new Error(`No Google account found for email: ${email}`);
    }
    return account;
  }

  protected async refreshTokenForAccount(email: string): Promise<void> {
    const account = await this.getAccount(email);
    try {
      const { credentials } = await account.oauth2Client.refreshAccessToken();
      account.credentials = credentials;
      account.oauth2Client.setCredentials(credentials);
      await this.tokenManager.updateToken(email, credentials);
    } catch (error) {
      this.logger.error(`Failed to refresh token for ${email}:`, error);
      throw error;
    }
  }

  protected async getAccessToken(email: string): Promise<string> {
    const account = await this.getAccount(email);
    if (!account.credentials || !account.credentials.access_token) {
      await this.refreshTokenForAccount(email);
    }
    return account.credentials?.access_token!;
  }

  protected async withAuth<T>(
    email: string,
    operation: (oauth2Client: Auth.OAuth2Client) => Promise<T>,
  ): Promise<T> {
    const account = await this.getAccount(email);
    try {
      return await operation(account.oauth2Client);
    } catch (error) {
      if (this.isAuthError(error)) {
        await this.refreshTokenForAccount(email);
        return await operation(account.oauth2Client);
      }
      throw error;
    }
  }

  protected async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    await this.rateLimiter.removeTokens(1);
    return operation();
  }

  private isAuthError(error: any): boolean {
    return error?.response?.status != null || error?.response?.status != null;
  }

  async getAuthUrl(email: string): Promise<string> {
    const account = await this.getAccount(email);
    return account.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: account.scopes,
    });
  }

  async handleAuthCallback(email: string, code: string): Promise<Auth.Credentials> {
    const account = await this.getAccount(email);
    const { tokens } = await account.oauth2Client.getToken(code);
    account.credentials = tokens;
    account.oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      await this.tokenManager.updateToken(email, tokens);
    }

    return tokens;
  }

  async searchGmailReceipts(email: string, query: string) {
    const account = this.accounts.get(email);
    if (!account || !account.oauth2Client) {
      throw new Error(`No account configuration found for ${email}`);
    }

    const accessToken = await this.getAccessToken(email);
    if (!accessToken) {
      throw new Error("Failed to get access token for Gmail");
    }

    const gmail = google.gmail({ version: "v1", auth: account.oauth2Client });

    return this.rateLimiter.withRateLimit("GMAIL.SEARCH", async () => {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
      });
      return response.data.messages || [];
    });
  }

  async searchPhotos(startDate: Date, endDate: Date): Promise<any> {
    throw new Error("Method not implemented. Use GooglePhotosService instead.");
  }
}
