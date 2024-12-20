import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { uploadToStorage } from '@/lib/storage';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const expenseId = fields.expenseId[0];

    // Read file
    const content = await fs.readFile(file.filepath);

    // Upload to storage (e.g., S3, Cloud Storage)
    const receiptUrl = await uploadToStorage(content, file.originalFilename || 'receipt.pdf');

    // Update expense in database
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        hasReceipt: true,
        receiptUrl,
      },
    });

    return res.json(expense);
  } catch (error) {
    console.error('Receipt upload failed:', error);
    return res.status(500).json({ error: 'Failed to upload receipt' });
  }
} 