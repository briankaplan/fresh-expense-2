import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().or(z.string().transform(val => parseInt(val))).default(1),
  limit: z.number().or(z.string().transform(val => parseInt(val))).default(10),
  sortBy: z.string().optional().default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const TransactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  merchant: z.string().optional(),
  minAmount: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
  maxAmount: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
  hasReceipt: z.boolean().or(z.string().transform(val => val === 'true')).optional()
});

export const TransactionSchema = z.object({
  userId: z.string(),
  transactionDate: z.string().or(z.date()),
  postDate: z.string().or(z.date()).nullable().optional(),
  amount: z.number().or(z.string().transform(val => parseFloat(val))),
  merchant: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.string(),
  comment: z.string().optional()
});

export const TransactionUpdateSchema = TransactionSchema.partial().omit({ userId: true });

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type TransactionFilterInput = z.infer<typeof TransactionFilterSchema>; 