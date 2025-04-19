import React from 'react';
import { DataTable, Column } from '@fresh-expense/ui';
import { formatCurrency } from '@fresh-expense/utils';
import { Merchant } from '@fresh-expense/types';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  totalSpent: number;
  transactionCount: number;
  lastTransactionDate: string;
}

interface MerchantListProps {
  merchants: Merchant[];
  loading?: boolean;
  onMerchantClick?: (merchant: Merchant) => void;
}

export function MerchantList({ merchants, loading = false, onMerchantClick }: MerchantListProps) {
  const columns: Column<Merchant>[] = [
    {
      id: 'name',
      label: 'Merchant',
      minWidth: 200,
      sortable: true,
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'totalSpent',
      label: 'Total Spent',
      minWidth: 150,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value),
      sortable: true,
    },
    {
      id: 'transactionCount',
      label: 'Transactions',
      minWidth: 100,
      align: 'right' as const,
      sortable: true,
    },
    {
      id: 'lastTransactionDate',
      label: 'Last Transaction',
      minWidth: 150,
      sortable: true,
    },
  ];

  return (
    <DataTable
      data={merchants}
      columns={columns}
      loading={loading}
      searchable
      sortable
      onRowClick={onMerchantClick}
    />
  );
}
