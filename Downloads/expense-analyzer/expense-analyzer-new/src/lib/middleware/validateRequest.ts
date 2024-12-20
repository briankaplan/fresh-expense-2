import { NextResponse } from 'next/server';
import { z } from 'zod';
import { categories } from '@/config/categories';

// Convert categories object to union type for validation
const categoryValues = Object.values(categories) as [string, ...string[]];

// Base schemas for reuse
const dateSchema = z.string().datetime({ message: "Invalid date format" });
const amountSchema = z.number()
  .min(-1000000, "Amount too low")
  .max(1000000, "Amount too high");
const descriptionSchema = z.string()
  .min(1, "Description is required")
  .max(500, "Description too long");

// Transaction schema with improved validation
export const transactionSchema = z.object({
  transactionDate: dateSchema,
  postDate: dateSchema.optional(),
  amount: amountSchema,
  merchant: z.string().min(1, "Merchant name is required").max(100).optional(),
  description: descriptionSchema.optional(),
  category: z.enum(categoryValues).optional(),
  type: z.enum(['personal', 'business', 'bank'] as const),
  hasReceipt: z.boolean().optional(),
  userId: z.string().min(1, "User ID is required"),
  comment: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

// Receipt schema
export const receiptSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  transactionId: z.string().optional(),
  metadata: z.object({
    originalFilename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    uploadedAt: z.string().datetime()
  }).optional()
});

// Expense schema
export const expenseSchema = z.object({
  date: dateSchema,
  amount: amountSchema,
  merchant: z.string().min(1, "Merchant name is required"),
  category: z.enum(categoryValues),
  description: descriptionSchema.optional(),
  isPersonal: z.boolean(),
  hasReceipt: z.boolean(),
  receiptUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional()
});

interface ValidationResult<T> {
  data: T | null;
  error: {
    message: string;
    details?: z.ZodError['errors'];
    code?: string;
  } | null;
}

export async function validateRequest<T>(
  req: Request, 
  schema: z.ZodSchema<T>,
  options: {
    stripUnknown?: boolean;
    strict?: boolean;
  } = {}
): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    
    const validated = schema.parse(body);
    return { data: validated, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        data: null, 
        error: { 
          message: 'Validation failed',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        }
      };
    }

    if (error instanceof Error) {
      return { 
        data: null, 
        error: { 
          message: error.message,
          code: 'PARSE_ERROR'
        }
      };
    }

    return { 
      data: null, 
      error: { 
        message: 'Invalid request data',
        code: 'UNKNOWN_ERROR'
      }
    };
  }
}

// Helper function to create API response
export function createResponse<T>(result: ValidationResult<T>) {
  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { 
        status: result.error.code === 'VALIDATION_ERROR' ? 400 : 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return NextResponse.json(
    { data: result.data },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
} 