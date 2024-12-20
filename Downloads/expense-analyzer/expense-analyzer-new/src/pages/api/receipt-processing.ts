import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { processReceipt } from '@/lib/mindee';
import { prisma } from '@/lib/prisma';

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

  try {
    const form = formidable();
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process receipt with OCR
    const ocrData = await processReceipt(file.filepath);

    // Save receipt data
    const receipt = await prisma.receipt.create({
      data: {
        url: file.filepath, // You might want to store this in cloud storage instead
        date: new Date(ocrData.date),
        merchant: ocrData.merchant,
        total: ocrData.total,
        tax: ocrData.tax,
        category: ocrData.category,
        items: ocrData.items,
      },
    });

    // Create corresponding expense
    const expense = await prisma.expense.create({
      data: {
        date: new Date(ocrData.date),
        description: `Receipt from ${ocrData.merchant}`,
        amount: ocrData.total,
        category: ocrData.category || 'other',
        type: 'personal',
        notes: `Processed from receipt ${receipt.id}`,
      },
    });

    return res.status(200).json({
      receipt,
      expense,
    });
  } catch (error) {
    console.error('Receipt processing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 