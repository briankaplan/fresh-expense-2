import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { processReceipt } from '@/lib/mindee';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { parseBankStatement } from '@/services/parsers/bankCSVParser';
import { parseExpensifyCSV } from '@/services/parsers/expensifyCSVParser';

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

  const uploadType = req.query.type as string;
  
  try {
    const form = formidable({
      maxFileSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760'),
      uploadDir: path.join(process.cwd(), 'tmp'),
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
    if (!uploadedFiles.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      try {
        switch (uploadType) {
          case 'receipts': {
            const ocrData = await processReceipt(file.filepath);
            const receipt = await prisma.receipt.create({
              data: {
                url: file.filepath, // In production, upload to cloud storage
                date: new Date(ocrData.date),
                merchant: ocrData.merchant,
                total: ocrData.total,
                tax: ocrData.tax,
                category: ocrData.category,
                items: ocrData.items,
              },
            });
            results.push(receipt);
            break;
          }
          
          case 'bank': {
            const content = await fs.readFile(file.filepath, 'utf-8');
            const transactions = await parseBankStatement(content);
            // Save transactions to database
            const savedTransactions = await Promise.all(
              transactions.map(transaction =>
                prisma.transaction.create({
                  data: {
                    date: new Date(transaction.date),
                    description: transaction.description,
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                  },
                })
              )
            );
            results.push(...savedTransactions);
            break;
          }
          
          case 'expensify': {
            const content = await fs.readFile(file.filepath, 'utf-8');
            const expenses = await parseExpensifyCSV(content);
            // Save expenses to database
            const savedExpenses = await Promise.all(
              expenses.map(expense =>
                prisma.expense.create({
                  data: {
                    date: new Date(expense.date),
                    merchant: expense.merchant,
                    amount: expense.amount,
                    category: expense.category,
                    description: expense.description,
                    receiptUrl: expense.receiptUrl,
                  },
                })
              )
            );
            results.push(...savedExpenses);
            break;
          }
          
          default:
            throw new Error(`Unsupported upload type: ${uploadType}`);
        }
      } finally {
        // Clean up temporary file
        await fs.unlink(file.filepath).catch(console.error);
      }
    }

    return res.status(200).json({
      message: 'Upload successful',
      results,
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 