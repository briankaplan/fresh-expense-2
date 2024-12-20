import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function withValidation(schema: z.ZodSchema, handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      req.body = schema.parse(req.body);
      return await handler(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      throw error;
    }
  };
}

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
} 