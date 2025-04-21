import { Injectable } from "@nestjs/common";
import axios, { type AxiosInstance } from "axios";

import { type ErrorHandlerService, ErrorType } from "../error-handler.service";
import type { LoggingService } from "../logging.service";
import type { RateLimiterService } from "../rate-limiter.service";

import type { ConfigService } from "@/core/config.service";

@Injectable()
export abstract class BaseAIService {
  protected client!: AxiosInstance;
  private readonly serviceName: string;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly rateLimiter: RateLimiterService,
    protected readonly errorHandler: ErrorHandlerService,
    protected readonly logger: LoggingService,
    serviceName: string,
  ) {
    this.serviceName = serviceName;
  }

  protected initializeClient(baseUrl: string, headers: Record<string, string> = {}) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      timeout: 30000,
    });
  }

  protected async withRateLimit<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await this.rateLimiter.withRateLimit(operation, fn);
    } catch (error) {
      const appError = this.errorHandler.createError(
        ErrorType.EXTERNAL_SERVICE,
        `Rate limit exceeded for ${operation}`,
        "RATE_LIMIT_EXCEEDED",
        { operation },
      );
      throw this.errorHandler.handleError(appError, this.serviceName);
    }
  }

  protected async executeWithRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        this.logger.debug(`Operation ${operation} succeeded on attempt ${attempt}`, {
          service: this.serviceName,
          operation,
          metadata: { attempt },
        });
        return result;
      } catch (error) {
        const appError = this.errorHandler.createError(
          ErrorType.EXTERNAL_SERVICE,
          `Operation ${operation} failed on attempt ${attempt}`,
          "OPERATION_FAILED",
          { operation, attempt },
        );
        lastError = this.errorHandler.handleError(appError, this.serviceName);

        if (attempt < maxRetries) {
          this.logger.warn(`Retry ${attempt}/${maxRetries} for ${operation}`, {
            service: this.serviceName,
            operation,
          });
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }
}
