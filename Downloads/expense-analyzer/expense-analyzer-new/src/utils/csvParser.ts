import { BankTransaction } from '@/types';

export function parseCSV(text: string): BankTransaction[] {
  const rows = text.split('\n').filter(row => row.trim());
  const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
  
  return rows.slice(1).map((row, index) => {
    const columns = row.split(',').map(col => col.trim());
    const rowData: { [key: string]: string } = {};
    
    headers.forEach((header, i) => {
      rowData[header] = columns[i] || '';
    });

    return {
      id: `tx-${index}`,
      date: new Date(rowData.date || rowData.transaction_date),
      description: rowData.description || rowData.merchant,
      amount: parseFloat(rowData.amount.replace(/[^0-9.-]+/g, '')),
      type: rowData.type || 'debit',
      category: rowData.category || 'uncategorized',
      status: 'pending'
    } as BankTransaction;
  });
} 