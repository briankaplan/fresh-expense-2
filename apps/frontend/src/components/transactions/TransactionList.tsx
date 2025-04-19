import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DataTable } from '../shared';
import { useNotification } from '../shared/Notification';

interface Transaction extends Record<string, unknown> {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  const { showNotification } = useNotification();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const columns = [
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'amount', label: 'Amount', minWidth: 120, align: 'right' },
    { id: 'category', label: 'Category', minWidth: 150 },
    { id: 'merchant', label: 'Merchant', minWidth: 150 },
  ] as const;

  const handleRowClick = (row: Record<string, unknown>) => {
    if (onTransactionClick) {
      onTransactionClick(row as Transaction);
    }
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Transactions
      </Typography>
      <DataTable<Transaction>
        columns={columns}
        data={transactions}
        onRowClick={handleRowClick}
        searchable
        defaultSortBy="date"
        defaultSortOrder="desc"
      />
    </Box>
  );
}
