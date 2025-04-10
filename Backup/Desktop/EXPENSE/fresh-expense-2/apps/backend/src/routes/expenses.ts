import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { ObjectId } from 'mongodb';
import { getDb } from '../db';
import fetch from 'node-fetch';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';

const router = Router();
const s3Client = new S3Client({
  region: process.env['AWS_REGION'] || 'auto',
  endpoint: process.env['R2_ENDPOINT'],
  credentials: {
    accessKeyId: process.env['R2_ACCESS_KEY_ID'] || '',
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] || '',
  }
});

// Schema for expense update
const expenseUpdateSchema = z.object({
  date: z.string().optional(),
  description: z.string().min(1).optional(),
  amount: z.number().optional(),
  category: z.string().min(1).optional(),
  merchant: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  receiptUrl: z.string().url().optional().nullable(),
});

// Schema for bulk import
const bulkImportSchema = z.object({
  data: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    category: z.string(),
    merchant: z.string().optional(),
    status: z.string().optional(),
    company: z.string(),
    tags: z.array(z.string()).optional(),
    receiptUrl: z.string().url().optional().nullable(),
  }))
});

// Schema for finding matches
const findMatchesSchema = z.object({
  data: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    category: z.string().optional(),
    merchant: z.string().optional(),
    receiptUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    company: z.string().optional(),
  }))
});

// Schema for enriching transactions
const enrichSchema = z.object({
  matches: z.array(z.object({
    csvData: z.object({
      date: z.string(),
      amount: z.number(),
      description: z.string().optional(),
      category: z.string().optional(),
      merchant: z.string().optional(),
      receiptUrl: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
      company: z.string().optional(),
    }),
    existingTransaction: z.object({
      id: z.string(),
      amount: z.number(),
      date: z.string(),
    }),
    matchConfidence: z.number().min(0).max(1),
  }))
});

async function downloadAndUploadReceipt(url: string): Promise<string> {
  try {
    // Download the receipt
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download receipt');
    const buffer = await response.buffer();

    // Generate a unique filename
    const hash = createHash('md5').update(url).digest('hex');
    const extension = url.split('.').pop() || 'pdf';
    const key = `receipts/${hash}.${extension}`;

    // Upload to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env['R2_BUCKET_NAME'],
      Key: key,
      Body: buffer,
      ContentType: response.headers.get('content-type') || 'application/pdf',
    }));

    // Return the R2 URL
    return `${process.env['R2_PUBLIC_URL']}/${key}`;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}

function calculateMatchConfidence(csvTransaction: any, existingTransaction: any): number {
  // Exact amount match is required
  if (csvTransaction.amount !== existingTransaction.amount) {
    return 0;
  }

  let confidence = 0.8; // Base confidence for matching amount

  // Date match within 3 days
  const csvDate = new Date(csvTransaction.date);
  const existingDate = new Date(existingTransaction.date);
  const daysDiff = Math.abs((csvDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 3) {
    return 0; // No match if dates are too far apart
  }
  
  // Additional confidence boosters
  if (daysDiff === 0) confidence += 0.2; // Exact date match
  if (csvTransaction.merchant && existingTransaction.description?.toLowerCase().includes(csvTransaction.merchant.toLowerCase())) {
    confidence += 0.1;
  }

  return Math.min(1, confidence); // Cap at 1.0
}

// PATCH /api/expenses/:id
router.patch('/:id', validateRequest({ body: expenseUpdateSchema }), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const db = await getDb();
    const collection = db.collection('expenses');

    // Validate that the expense exists
    const existingExpense = await collection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update the expense
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: 'Failed to update expense' });
  }
});

// POST /api/expenses/bulk-import
router.post('/bulk-import', validateRequest({ body: bulkImportSchema }), async (req, res) => {
  try {
    const { data } = req.body;
    const db = await getDb();
    const collection = db.collection('expenses');

    // Insert all expenses
    const result = await collection.insertMany(data);

    res.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error('Error bulk importing expenses:', error);
    res.status(500).json({ error: 'Failed to import expenses' });
  }
});

// POST /api/expenses/find-matches
router.post('/find-matches', validateRequest({ body: findMatchesSchema }), async (req, res) => {
  try {
    const { data: csvTransactions } = req.body;
    const db = await getDb();
    const collection = db.collection('expenses');

    const matches: any[] = [];

    // For each CSV transaction, find potential matches in the database
    for (const csvTransaction of csvTransactions) {
      const startDate = new Date(csvTransaction.date);
      startDate.setDate(startDate.getDate() - 3);
      const endDate = new Date(csvTransaction.date);
      endDate.setDate(endDate.getDate() + 3);

      const existingTransactions = await collection
        .find({
          amount: csvTransaction.amount,
          date: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          }
        })
        .toArray();

      for (const existingTransaction of existingTransactions) {
        const confidence = calculateMatchConfidence(csvTransaction, existingTransaction);
        if (confidence > 0) {
          matches.push({
            csvData: csvTransaction,
            existingTransaction: {
              id: existingTransaction._id.toString(),
              ...existingTransaction
            },
            matchConfidence: confidence
          });
        }
      }
    }

    res.json(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// POST /api/expenses/enrich
router.post('/enrich', validateRequest({ body: enrichSchema }), async (req, res) => {
  try {
    const { matches } = req.body;
    const db = await getDb();
    const collection = db.collection('expenses');
    let enrichedCount = 0;

    for (const match of matches) {
      if (match.matchConfidence >= 0.8) {
        const updateData: any = {};
        
        // Only update fields that exist in the CSV and aren't already set
        if (match.csvData.description) updateData.description = match.csvData.description;
        if (match.csvData.category) updateData.category = match.csvData.category;
        if (match.csvData.merchant) updateData.merchant = match.csvData.merchant;
        if (match.csvData.tags) updateData.tags = match.csvData.tags;
        if (match.csvData.company) updateData.company = match.csvData.company;

        // Handle receipt if present
        if (match.csvData.receiptUrl) {
          try {
            const r2Url = await downloadAndUploadReceipt(match.csvData.receiptUrl);
            updateData.receiptUrl = r2Url;
          } catch (error) {
            console.error(`Failed to process receipt for transaction ${match.existingTransaction.id}:`, error);
          }
        }

        // Update the transaction if we have any new data
        if (Object.keys(updateData).length > 0) {
          const result = await collection.updateOne(
            { _id: new ObjectId(match.existingTransaction.id) },
            { $set: updateData }
          );
          
          if (result.modifiedCount > 0) {
            enrichedCount++;
          }
        }
      }
    }

    res.json({ success: true, enrichedCount });
  } catch (error) {
    console.error('Error enriching transactions:', error);
    res.status(500).json({ error: 'Failed to enrich transactions' });
  }
});

export default router; 