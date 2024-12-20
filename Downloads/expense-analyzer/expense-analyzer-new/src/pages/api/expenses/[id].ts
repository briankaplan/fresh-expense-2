import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const expense = await prisma.expense.update({
        where: { id: String(id) },
        data: req.body,
        include: {
          transaction: true,
        },
      });

      return res.json(expense);
    } catch (error) {
      console.error('Failed to update expense:', error);
      return res.status(500).json({ error: 'Failed to update expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 