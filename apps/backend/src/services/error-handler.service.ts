import { Injectable, Logger } from "@nestjs/common";

import type { NotificationService } from "./notification/notification.service";

export enum ErrorType {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  INTERNAL = "INTERNAL",
}

export interface AppError extends Error {
  type: ErrorType;
  code: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  constructor(private readonly notificationService: NotificationService) {}

  createError(
    type: ErrorType,
    message: string,
    code: string,
    metadata?: Record<string, any>,
  ): AppError {
    const error = new Error(message) as AppError;
    error.type = type;
    error.code = code;
    error.metadata = metadata;
    return error;
  }

  handleError(error: unknown, context?: string): AppError {
    const typedError = this.normalizeError(error);
    this.logError(typedError, context);
    this.notifyError(typedError, context);
    return typedError;
  }

  private normalizeError(error: unknown): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return this.createError(ErrorType.INTERNAL, error.message, "UNKNOWN_ERROR", {
        originalError: error,
      });
    }

    return this.createError(ErrorType.INTERNAL, "An unknown error occurred", "UNKNOWN_ERROR", {
      originalError: error,
    });
  }

  private isAppError(error: unknown): error is AppError {
    return (
      error instanceof Error &&
      "type" in error &&
      "code" in error &&
      Object.values(ErrorType).includes((error as AppError).type)
    );
  }

  private logError(error: AppError, context?: string) {
    const contextPrefix = context ? `[${context}] ` : "";
    const metadata = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata)}` : "";

    switch (error.type) {
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        this.logger.warn(`${contextPrefix}${error.message}${metadata}`);
        break;
      case ErrorType.NOT_FOUND:
        this.logger.debug(`${contextPrefix}${error.message}${metadata}`);
        break;
      default:
        this.logger.error(`${contextPrefix}${error.message}${metadata}`);
    }
  }

  private notifyError(error: AppError, context?: string) {
    const title = context ? `${context} Error` : "Error";
    const message = `${error.type}: ${error.message}`;

    switch (error.type) {
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        this.notificationService.notify({
          type: "warning",
          title,
          message,
          metadata: error.metadata,
        });
        break;
      case ErrorType.RATE_LIMIT:
      case ErrorType.EXTERNAL_SERVICE:
        this.notificationService.notify({
          type: "error",
          title,
          message,
          metadata: error.metadata,
        });
        break;
      case ErrorType.INTERNAL:
        this.notificationService.notify({
          type: "error",
          title,
          message,
          metadata: { ...error.metadata, code: error.code },
        });
        break;
    }
  }
}
