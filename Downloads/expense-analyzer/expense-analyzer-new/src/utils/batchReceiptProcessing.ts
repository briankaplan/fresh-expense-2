import { BankTransaction, ProcessedReceipt, OCRResult } from '@/types';
import { matchExpenseToTransaction } from './expenseMatching';

async function processReceipt(file: File): Promise<OCRResult> {
  // TODO: Implement actual OCR processing
  // This is a mock implementation
  return {
    merchant: file.name.split('.')[0],
    date: new Date().toISOString().split('T')[0],
    total: Math.random() * 1000,
    confidence: 0.95,
    items: [
      {
        description: "Sample Item",
        amount: Math.random() * 100,
      }
    ]
  };
}

async function uploadReceipt(file: File): Promise<string> {
  // TODO: Implement actual file upload
  // This is a mock implementation
  return URL.createObjectURL(file);
}

export async function processBatchReceipts(
  files: File[],
  transactions: BankTransaction[]
): Promise<{
  matched: ProcessedReceipt[];
  unmatched: File[];
}> {
  const matched: ProcessedReceipt[] = [];
  const unmatched: File[] = [];

  for (const file of files) {
    try {
      // Process the receipt with OCR
      const ocrData = await processReceipt(file);
      
      // Upload the receipt and get URL
      const receiptUrl = await uploadReceipt(file);

      // Find matching transaction
      let bestMatch: BankTransaction | null = null;
      let bestScore = 0;

      for (const tx of transactions) {
        const { isMatch, confidence } = matchExpenseToTransaction({
          date: ocrData.date,
          amount: ocrData.total,
          merchant: ocrData.merchant
        }, tx);

        if (isMatch && confidence > bestScore) {
          bestMatch = tx;
          bestScore = confidence;
        }
      }

      if (bestMatch && bestScore > 0.7) { // 70% confidence threshold
        matched.push({
          transactionId: bestMatch.id,
          receiptUrl,
          ocrData
        });
      } else {
        unmatched.push(file);
      }

    } catch (error) {
      console.error('Failed to process receipt:', file.name, error);
      unmatched.push(file);
    }
  }

  return { matched, unmatched };
} 