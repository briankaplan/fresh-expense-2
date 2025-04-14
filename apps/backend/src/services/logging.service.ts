import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from './config.service';

interface LogContext {
  service?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  trace?: string;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
}

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: Logger;
  private config: LoggingConfig;

  constructor(configService: ConfigService) {
    this.logger = new Logger(LoggingService.name);
    this.config = configService.getLoggingConfig();
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (this.config.format === 'json') {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        level: this.config.level,
        message,
        ...context,
      });
    }

    const contextStr = context
      ? Object.entries(context)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join(' ')
      : '';

    return `[${new Date().toISOString()}] ${message} ${contextStr}`.trim();
  }

  log(message: string, context?: LogContext) {
    if (this.config.level === 'debug' || this.config.level === 'info') {
      this.logger.log(this.formatMessage(message, context));
    }
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.logger.error(
      this.formatMessage(message, {
        ...context,
        trace,
      })
    );
  }

  warn(message: string, context?: LogContext) {
    if (this.config.level !== 'error') {
      this.logger.warn(this.formatMessage(message, context));
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.config.level === 'debug') {
      this.logger.debug(this.formatMessage(message, context));
    }
  }

  verbose(message: string, context?: LogContext) {
    if (this.config.level === 'debug') {
      this.logger.verbose(this.formatMessage(message, context));
    }
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.config.level = level;
  }

  setLogFormat(format: 'json' | 'text') {
    this.config.format = format;
  }
} 