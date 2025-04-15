import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface AppConfig {
  // Database
  database: {
    url: string;
    name: string;
    user: string;
    password: string;
  };

  // AI Services
  ai: {
    huggingface: {
      apiKey: string;
      model: string;
    };
    bert: {
      serverUrl: string;
    };
  };

  // Storage
  storage: {
    r2: {
      accessKeyId: string;
      secretAccessKey: string;
      bucketName: string;
      region: string;
    };
  };

  // Authentication
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    google: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
  };

  // Rate Limiting
  rateLimits: {
    [key: string]: {
      maxRequests: number;
      timeWindow: number;
      backoffStrategy?: 'linear' | 'exponential';
      maxRetries?: number;
    };
  };

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private config!: AppConfig;

  constructor(private readonly nestConfigService: NestConfigService) {
    this.validateAndLoadConfig();
  }

  private validateAndLoadConfig() {
    try {
      this.config = {
        database: {
          url: this.getRequiredString('DATABASE_URL'),
          name: this.getRequiredString('DATABASE_NAME'),
          user: this.getRequiredString('DATABASE_USER'),
          password: this.getRequiredString('DATABASE_PASSWORD'),
        },
        ai: {
          huggingface: {
            apiKey: this.getRequiredString('HUGGINGFACE_API_KEY'),
            model: this.getOptionalString(
              'HUGGINGFACE_MODEL',
              'sentence-transformers/all-MiniLM-L6-v2'
            ),
          },
          bert: {
            serverUrl: this.getRequiredString('BERT_SERVER_URL'),
          },
        },
        storage: {
          r2: {
            accessKeyId: this.getRequiredString('R2_ACCESS_KEY_ID'),
            secretAccessKey: this.getRequiredString('R2_SECRET_ACCESS_KEY'),
            bucketName: this.getRequiredString('R2_BUCKET_NAME'),
            region: this.getRequiredString('R2_REGION'),
          },
        },
        auth: {
          jwtSecret: this.getRequiredString('JWT_SECRET'),
          jwtExpiresIn: this.getOptionalString('JWT_EXPIRES_IN', '7d'),
          google: {
            clientId: this.getRequiredString('GOOGLE_CLIENT_ID'),
            clientSecret: this.getRequiredString('GOOGLE_CLIENT_SECRET'),
            redirectUri: this.getRequiredString('GOOGLE_REDIRECT_URI'),
          },
        },
        rateLimits: this.getOptionalObject('RATE_LIMITS', {}),
        logging: {
          level: this.getOptionalString('LOG_LEVEL', 'info') as AppConfig['logging']['level'],
          format: this.getOptionalString('LOG_FORMAT', 'text') as AppConfig['logging']['format'],
        },
      };
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      throw error;
    }
  }

  private getRequiredString(key: string): string {
    const value = this.nestConfigService.get<string>(key);
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  private getOptionalString(key: string, defaultValue: string): string {
    return this.nestConfigService.get<string>(key) || defaultValue;
  }

  private getOptionalObject<T>(key: string, defaultValue: T): T {
    try {
      const value = this.nestConfigService.get<T>(key);
      return value || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getDatabaseConfig(): AppConfig['database'] {
    return this.config.database;
  }

  getAIConfig(): AppConfig['ai'] {
    return this.config.ai;
  }

  getStorageConfig(): AppConfig['storage'] {
    return this.config.storage;
  }

  getAuthConfig(): AppConfig['auth'] {
    return this.config.auth;
  }

  getRateLimits(): AppConfig['rateLimits'] {
    return this.config.rateLimits;
  }

  getLoggingConfig(): AppConfig['logging'] {
    return this.config.logging;
  }
}
