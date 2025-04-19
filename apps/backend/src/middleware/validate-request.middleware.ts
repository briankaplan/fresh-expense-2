import { Injectable, NestMiddleware, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware for validating incoming requests
 * Checks for required headers, content type, and request size limits
 */
@Injectable()
export class ValidateRequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateRequestMiddleware.name);
  private readonly MAX_REQUEST_SIZE = '10mb';

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug(`Validating request: ${req.method} ${req.path}`);

      // Validate content type for POST/PUT requests
      if (['POST', 'PUT'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          throw new HttpException(
            'Content-Type must be application/json',
            HttpStatus.UNSUPPORTED_MEDIA_TYPE
          );
        }
      }

      // Validate request size
      const contentLength = req.headers['content-length'];
      if (contentLength) {
        const sizeInMB = parseInt(contentLength) / (1024 * 1024);
        if (sizeInMB > 10) {
          throw new HttpException(
            `Request body too large. Maximum size is ${this.MAX_REQUEST_SIZE}`,
            HttpStatus.PAYLOAD_TOO_LARGE
          );
        }
      }

      // Validate required headers
      const requiredHeaders = ['x-request-id'];
      for (const header of requiredHeaders) {
        if (!req.headers[header]) {
          throw new HttpException(
            `Missing required header: ${header}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      this.logger.debug('Request validation passed');
      next();
    } catch (error) {
      this.logger.error(
        'Request validation failed',
        error instanceof Error ? error.stack : undefined
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during request validation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
