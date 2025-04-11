import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { Injectable, NestMiddleware } from '@nestjs/common';

interface ValidateSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validateRequest = (schema: ValidateSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: 'Validation failed' });
    }
  };
};

@Injectable()
export class ValidateRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validate Content-Type header to mitigate security vulnerability
    const contentType = req.headers['content-type'];
    if (contentType) {
      // Only allow specific content types
      const allowedContentTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
      ];
      
      // Extract base content type without parameters
      const baseContentType = contentType.split(';')[0].toLowerCase();
      
      if (!allowedContentTypes.includes(baseContentType)) {
        return res.status(415).json({
          statusCode: 415,
          message: 'Unsupported Media Type',
          error: 'The Content-Type header contains an unsupported value'
        });
      }
    }

    // Validate other headers as needed
    const existingValidation = this.validateHeaders(req);
    if (!existingValidation.isValid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad Request',
        error: existingValidation.error
      });
    }

    next();
  }

  private validateHeaders(req: Request): { isValid: boolean; error?: string } {
    // Add existing header validation logic here
    return { isValid: true };
  }
} 