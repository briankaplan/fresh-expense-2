import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/shared/components/common/DashboardCard";
import { formatCurrency } from "@/utils/format";
import type { Transaction } from "@fresh-expense/types";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface DashboardStats {
  totalExpenses: number;
  missingReceipts: number;
  uncategorizedTransactions: number;
  expensesByCompany: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    missingReceipts: 0,
    uncategorizedTransactions: 0,
    expensesByCompany: {},
    expensesByCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.firstName || "User"}`}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Total Expenses" subtitle="This month" icon="AttachMoney">
            <Typography variant="h4" color="primary">
              {formatCurrency(stats.totalExpenses)}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Missing Receipts" subtitle="Requires attention" icon="Receipt">
            <Typography variant="h4" color="error">
              {stats.missingReceipts}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Uncategorized" subtitle="Needs review" icon="Category">
            <Typography variant="h4" color="warning">
              {stats.uncategorizedTransactions}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Companies" subtitle="Active accounts" icon="Business">
            <Typography variant="h4" color="success">
              {Object.keys(stats.expensesByCompany).length}
            </Typography>
          </DashboardCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
