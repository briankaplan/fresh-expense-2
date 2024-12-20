'use client';

import { Client, ReceiptV5 } from 'mindee';

const mindeeClient = new Client({ apiKey: process.env.MINDEE_API_KEY });

interface ProcessedReceipt {
  date: string;
  merchant: string;
  total: number;
  tax: number;
  category: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
}

export async function processReceipt(filepath: string): Promise<ProcessedReceipt> {
  try {
    // Load the receipt document
    const doc = await mindeeClient.docFromPath(filepath);
    
    // Parse the receipt using ReceiptV5
    const result = await doc.parse(ReceiptV5);
    const prediction = result.document;

    // Extract the data
    return {
      date: prediction.date?.value || new Date().toISOString(),
      merchant: prediction.supplier?.value || 'Unknown Merchant',
      total: prediction.totalAmount?.value || 0,
      tax: prediction.totalTax?.value || 0,
      category: inferCategory(prediction.supplier?.value || ''),
      items: prediction.lineItems?.map(item => ({
        description: item.description || 'Unknown Item',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalAmount: item.totalAmount || 0,
      })) || [],
    };
  } catch (error) {
    console.error('Mindee OCR processing error:', error);
    throw new Error('Failed to process receipt with OCR');
  }
}

function inferCategory(merchantName: string): string {
  const lowerMerchant = merchantName.toLowerCase();
  
  if (lowerMerchant.includes('restaurant') || lowerMerchant.includes('cafe')) {
    return 'food';
  }
  if (lowerMerchant.includes('uber') || lowerMerchant.includes('lyft')) {
    return 'transportation';
  }
  if (lowerMerchant.includes('market') || lowerMerchant.includes('grocery')) {
    return 'groceries';
  }
  if (lowerMerchant.includes('amazon') || lowerMerchant.includes('walmart')) {
    return 'shopping';
  }
  
  return 'other';
} 