import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Tabs, Tab } from '@mui/material';
import { TransactionListContainer } from '../TransactionList/TransactionListContainer';
import { ReceiptBank } from '@/features/receipts/components/ReceiptBank/ReceiptBank';
import { formatCurrency } from '@utils';
import { toast } from 'react-hot-toast';
import { Transaction } from '@fresh-expense/types';

interface DashboardStats {
  totalExpenses: number;
  missingReceipts: number;
  uncategorizedTransactions: number;
  expensesByCompany: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    missingReceipts: 0,
    uncategorizedTransactions: 0,
    expensesByCompany: {},
    expensesByCategory: {},
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchStats();
  }, [selectedCompany]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCompany) queryParams.append('company', selectedCompany);

      const response = await fetch(`/api/expenses/stats?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    color = 'primary',
  }: {
    title: string;
    value: string | number;
    color?: 'primary' | 'secondary' | 'error';
  }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Expense Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Overview" />
          <Tab label="Transactions" />
          <Tab label="Receipts" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Expenses"
                value={formatCurrency(stats.totalExpenses)}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Missing Receipts" value={stats.missingReceipts} color="error" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Uncategorized"
                value={stats.uncategorizedTransactions}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Selected Company" value={selectedCompany || 'All Companies'} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Expenses by Company
                </Typography>
                {Object.entries(stats.expensesByCompany).map(([company, amount]) => (
                  <Box key={company} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {company}
                    </Typography>
                    <Typography variant="body1">{formatCurrency(amount)}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Expenses by Category
                </Typography>
                {Object.entries(stats.expensesByCategory).map(([category, amount]) => (
                  <Box key={category} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {category}
                    </Typography>
                    <Typography variant="body1">{formatCurrency(amount)}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <TransactionListContainer company={selectedCompany} onCompanyChange={setSelectedCompany} />
      )}

      {activeTab === 2 && (
        <ReceiptBank
          company={selectedCompany}
          transactions={transactions}
          onReceiptsChange={receipts => {
            // Update stats when receipts change
            setStats(prev => ({
              ...prev,
              missingReceipts: receipts.filter(r => !r.transactionId).length,
            }));
          }}
        />
      )}
    </Box>
  );
}
