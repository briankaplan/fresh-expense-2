import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid transaction ID' });
  }

  switch (req.method) {
    case 'GET':
      return getTransaction(id, res);
    case 'PUT':
      return updateTransaction(id, req, res);
    case 'DELETE':
      return deleteTransaction(id, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET /api/transactions/[id]
async function getTransaction(id: string, res: NextApiResponse) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        receipt: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

// PUT /api/transactions/[id]
async function updateTransaction(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
        postDate: data.postDate ? new Date(data.postDate) : null,
        amount: data.amount ? parseFloat(data.amount) : undefined,
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

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
}

// DELETE /api/transactions/[id]
async function deleteTransaction(id: string, res: NextApiResponse) {
  try {
    await prisma.transaction.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
} 