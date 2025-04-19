import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { getDb } from '@/core/database';
import { validateRequest } from '@/shared/middleware/validateRequest';

const router = Router();

// Schema for transaction update
const transactionUpdateSchema = z.object({
  date: z.string().optional(),
  description: z.string().min(1).optional(),
  amount: z.number().optional(),
  category: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  type: z.enum(['income', 'expense']).optional(),
});

// Schema for bulk import
const bulkImportSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      description: z.string(),
      amount: z.number(),
      category: z.string(),
      status: z.string().optional(),
      type: z.enum(['income', 'expense']),
    }),
  ),
});

// PATCH /api/transactions/:id
router.patch('/:id', validateRequest({ body: transactionUpdateSchema }), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const db = await getDb();
    const collection = db.collection('transactions');

    // Validate that the transaction exists
    const existingTransaction = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update the transaction
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// POST /api/transactions/bulk-import
router.post('/bulk-import', validateRequest({ body: bulkImportSchema }), async (req, res) => {
  try {
    const { data } = req.body;
    const db = await getDb();
    const collection = db.collection('transactions');

    // Insert all transactions
    const result = await collection.insertMany(data);

    res.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    });
  } catch (error) {
    console.error('Error bulk importing transactions:', error);
    res.status(500).json({ error: 'Failed to import transactions' });
  }
});

export default router;
