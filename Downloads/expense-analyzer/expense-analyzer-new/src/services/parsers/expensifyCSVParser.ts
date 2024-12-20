import { parse } from 'csv-parse/sync';

interface ExpensifyExpense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  description?: string;
  receiptUrl?: string;
}

export async function parseExpensifyCSV(content: string): Promise<ExpensifyExpense[]> {
  try {
    // Parse CSV content
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    // Map CSV records to ExpensifyExpense objects
    return records.map((record: any, index: number) => ({
      id: `expensify-${Date.now()}-${index}`,
      date: new Date(record.date).toISOString(),
      merchant: record.merchant?.trim() || 'Unknown Merchant',
      category: record.category?.trim() || 'other',
      amount: parseFloat(record.amount?.replace(/[^0-9.-]/g, '') || '0'),
      description: record.description?.trim(),
      receiptUrl: record.receipt_url?.trim(),
    }));
  } catch (error) {
    console.error('Failed to parse Expensify CSV:', error);
    throw new Error('Invalid Expensify CSV format');
  }
} 