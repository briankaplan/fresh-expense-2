import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { Auth } from 'googleapis';

interface TokenCache {
  token: string;
  expiry: number;
}

interface AccountConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  scopes: string[];
  oAuth2Client: OAuth2Client | null;
  credentials: {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expiry_date?: number;
  } | null;
}

@Injectable()
export class TokenManagerService implements OnModuleInit {
  private readonly logger = new Logger(TokenManagerService.name);
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly'
  ];
  private readonly accounts = new Map<string, {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    scopes: string[];
    oAuth2Client: any | null;
    credentials: any | null;
  }>();
  private initialized = false;
  private tokenCache = new Map<string, Auth.Credentials>();

  // Token refresh buffer (5 minutes before expiry)
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.setupAccounts();
  }

  private setupAccounts() {
    // Account 1
    this.accounts.set('kaplan.brian@gmail.com', {
      clientId: this.configService.get<string>('GMAIL_CLIENT_ID_1')!,
      clientSecret: this.configService.get<string>('GMAIL_CLIENT_SECRET_1')!,
      refreshToken: this.configService.get<string>('GMAIL_REFRESH_TOKEN_1')!,
      scopes: this.SCOPES,
      oAuth2Client: null,
      credentials: null
    });

    // Account 2
    this.accounts.set('brian@downhome.com', {
      clientId: this.configService.get<string>('GMAIL_CLIENT_ID_2')!,
      clientSecret: this.configService.get<string>('GMAIL_CLIENT_SECRET_2')!,
      refreshToken: this.configService.get<string>('GMAIL_REFRESH_TOKEN_2')!,
      scopes: this.SCOPES,
      oAuth2Client: null,
      credentials: null
    });

    // Google Photos (using account 1 credentials)
    this.accounts.set('photos', {
      clientId: this.configService.get<string>('GMAIL_CLIENT_ID_1')!,
      clientSecret: this.configService.get<string>('GMAIL_CLIENT_SECRET_1')!,
      refreshToken: this.configService.get<string>('GMAIL_REFRESH_TOKEN_1')!,
      scopes: this.SCOPES,
      oAuth2Client: null,
      credentials: null
    });
  }

  async init() {
    if (this.initialized) return;

    try {
      for (const [email, account] of this.accounts) {
        // Create OAuth2 client for this account
        account.oAuth2Client = new OAuth2Client(
          account.clientId,
          account.clientSecret,
          email === 'photos' 
            ? this.configService.get<string>('GOOGLE_PHOTOS_REDIRECT_URI')
            : this.configService.get<string>('GOOGLE_REDIRECT_URI')
        );

        // Set initial credentials if refresh token exists
        if (account.refreshToken) {
          try {
            this.logger.log(`Refreshing token for ${email}...`);
            await this.refreshTokenForAccount(email);
            this.logger.log(`Initialized OAuth2 client for ${email}`);
          } catch (error) {
            this.logger.error(`Failed to refresh token for ${email}:`, error);
            if (error instanceof Error && error.message.includes('invalid_grant')) {
              this.logger.error('Token expired and cannot be refreshed. Please re-authenticate.');
            }
          }
        }
      }

      this.initialized = true;
      this.logger.log('Token Manager initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Token Manager:', error);
      throw error;
    }
  }

  private async refreshTokenForAccount(email: string): Promise<string> {
    const account = this.accounts.get(email);
    if (!account || !account.oAuth2Client) {
      throw new Error(`No account configuration found for ${email}`);
    }

    try {
      const response = await account.oAuth2Client.getAccessToken();
      const credentials = response.res?.data as Credentials;
      
      if (!credentials?.access_token) {
        throw new Error('Failed to get access token');
      }

      account.credentials = {
        access_token: credentials.access_token,
        refresh_token: account.refreshToken,
        scope: account.scopes.join(' '),
        token_type: 'Bearer',
        expiry_date: credentials.expiry_date || new Date().getTime() + (3600 * 1000) // Default 1 hour if no expiry
      };
      account.oAuth2Client.setCredentials(account.credentials);
      
      // Update cache
      this.tokenCache.set(email, account.credentials as Auth.Credentials);

      return account.credentials.access_token;
    } catch (error) {
      this.logger.error(`Error refreshing token for ${email}:`, error);
      throw error;
    }
  }

  async getAccessToken(email: string): Promise<string | null> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const account = this.accounts.get(email);
      if (!account) {
        this.logger.warn(`No account configuration found for ${email}`);
        return null;
      }

      // Check if we have valid credentials
      if (account.credentials?.access_token) {
        const expiryDate = new Date(account.credentials.expiry_date);
        const now = new Date();

        // If token is still valid (with buffer), return it
        if (expiryDate.getTime() - now.getTime() > this.TOKEN_REFRESH_BUFFER) {
          return account.credentials.access_token;
        }
      }

      // Token needs refresh
      this.logger.log(`Refreshing token for ${email}...`);
      return await this.refreshTokenForAccount(email);
    } catch (error) {
      this.logger.error('Error getting access token:', error);
      return null;
    }
  }

  async getPhotosAccessToken(): Promise<string | null> {
    return this.getAccessToken('photos');
  }

  async getGmailAccessToken(email: string): Promise<string | null> {
    return this.getAccessToken(email);
  }

  getEmailAccounts(): string[] {
    return Array.from(this.accounts.keys()).filter(email => email !== 'photos');
  }

  clearTokenCache(email: string): void {
    this.tokenCache.delete(email);
  }

  clearAllTokenCaches(): void {
    this.tokenCache.clear();
  }

  async updateToken(email: string, credentials: Auth.Credentials): Promise<void> {
    this.tokenCache.set(email, credentials);
    this.logger.debug(`Updated token for ${email}`);
  }

  async getToken(email: string): Promise<Auth.Credentials | null> {
    return this.tokenCache.get(email) || null;
  }
} 