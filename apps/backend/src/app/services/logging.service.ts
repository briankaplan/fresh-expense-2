import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable, type LoggerService } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import * as winston from "winston";

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logsDir = path.join(process.cwd(), "logs");

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logLevel = this.configService.get<string>("logging.level", "debug");
    const enableDebug = this.configService.get<boolean>("logging.enableDebug", true);

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        // Write all logs to console
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
          filename: path.join(logsDir, "combined.log"),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Write all errors to error.log
        new winston.transports.File({
          filename: path.join(logsDir, "error.log"),
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    if (enableDebug) {
      this.logger.add(
        new winston.transports.File({
          filename: path.join(logsDir, "debug.log"),
          level: "debug",
          maxsize: 5242880, // 5MB
          maxFiles: 3,
        }),
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
