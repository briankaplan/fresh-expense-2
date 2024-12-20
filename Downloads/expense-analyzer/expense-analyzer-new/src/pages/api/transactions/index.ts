import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withErrorHandler, withValidation } from '@/lib/api/middleware';
import { TransactionSchema, PaginationSchema, TransactionFilterSchema } from '@/lib/api/schemas';
import type { PaginationInput, TransactionFilterInput } from '@/lib/api/schemas';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withErrorHandler(getTransactions)(req, res);
    case 'POST':
      return withErrorHandler(withValidation(TransactionSchema, createTransaction))(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET /api/transactions
async function getTransactions(req: NextApiRequest, res: NextApiResponse) {
  // Parse and validate query parameters
  const pagination = PaginationSchema.parse(req.query);
  const filters = TransactionFilterSchema.parse(req.query);
  
  // Build where clause based on filters
  const where = buildWhereClause(filters);
  
  // Get total count for pagination
  const total = await prisma.transaction.count({ where });
  
  // Get paginated results
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      receipt: true
    },
    orderBy: {
      [pagination.sortBy]: pagination.sortOrder
    },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit
  });
  
  return res.status(200).json({
    data: transactions,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  });
}

function buildWhereClause(filters: TransactionFilterInput) {
  const where: any = {};
  
  if (filters.startDate) {
    where.transactionDate = {
      ...where.transactionDate,
      gte: new Date(filters.startDate)
    };
  }
  
  if (filters.endDate) {
    where.transactionDate = {
      ...where.transactionDate,
      lte: new Date(filters.endDate)
    };
  }
  
  if (filters.category) {
    where.category = filters.category;
  }
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.merchant) {
    where.merchant = {
      contains: filters.merchant,
      mode: 'insensitive'
    };
  }
  
  if (filters.minAmount) {
    where.amount = {
      ...where.amount,
      gte: filters.minAmount
    };
  }
  
  if (filters.maxAmount) {
    where.amount = {
      ...where.amount,
      lte: filters.maxAmount
    };
  }
  
  if (filters.hasReceipt !== undefined) {
    where.hasReceipt = filters.hasReceipt;
  }
  
  return where;
}

// POST /api/transactions
async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;
  
  const transaction = await prisma.transaction.create({
    data: {
      userId: data.userId,
      transactionDate: new Date(data.transactionDate),
      postDate: data.postDate ? new Date(data.postDate) : null,
      amount: parseFloat(data.amount),
      merchant: data.merchant,
      description: data.description,
      category: data.category,
      type: data.type,
      comment: data.comment
    },
    include: {
      receipt: true
    }
  });
  
  return res.status(201).json(transaction);
} 