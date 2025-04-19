import type { Transaction } from "@fresh-expense/types";
import { CsvUploader } from "@fresh-expense/ui";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { TransactionList } from "./TransactionList";

interface TransactionListContainerProps {
  company?: string;
  onCompanyChange?: (company: string) => void;
}

export function TransactionListContainer({
  company,
  onCompanyChange,
}: TransactionListContainerProps) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Fetch transactions with React Query
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", company, selectedCategory, dateRange, amountRange],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (company) queryParams.append("company", company);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (dateRange.start) queryParams.append("startDate", dateRange.start.toISOString());
      if (dateRange.end) queryParams.append("endDate", dateRange.end.toISOString());
      if (amountRange.min) queryParams.append("minAmount", amountRange.min);
      if (amountRange.max) queryParams.append("maxAmount", amountRange.max);

      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  // Update transaction mutation with optimistic updates
  const updateTransactionMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: keyof Transaction;
      value: any;
    }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      return response.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(["transactions"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Transaction[]>(["transactions"], (old) =>
        old?.map((t) => (t.id != null ? { ...t, [variables.field]: variables.value } : t)),
      );

      return { previousTransactions };
    },
    onError: (_err, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(["transactions"], context.previousTransactions);
      }
      toast.error("Failed to update transaction");
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // AI Categorize mutation
  const categorizeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}/categorize`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to categorize transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction categorized successfully");
    },
    onError: () => {
      toast.error("Failed to categorize transaction");
    },
  });

  const handleEdit = async (transaction: Transaction, field: keyof Transaction, value: any) => {
    try {
      // Validate the value based on the field type
      if (field === "amount" && Number.isNaN(Number(value))) {
        throw new Error("Invalid amount");
      }
      if (field === "date" && !isValidDate(value)) {
        throw new Error("Invalid date");
      }

      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        field,
        value: field === "amount" ? Number(value) : value,
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleReceiptClick = async (transaction: Transaction) => {
    // Implement receipt viewer logic
    console.log("View receipt for transaction:", transaction.id);
  };

  const handleAICategorize = async (transaction: Transaction) => {
    try {
      await categorizeMutation.mutateAsync(transaction.id);
    } catch (error) {
      console.error("Error categorizing transaction:", error);
    }
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    toast.success("Transactions uploaded successfully");
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Company"
              value={company}
              onChange={(e) => onCompanyChange?.(e.target.value)}
            >
              <MenuItem value="Down Home">Down Home</MenuItem>
              <MenuItem value="Music City Rodeo">Music City Rodeo</MenuItem>
              <MenuItem value="Personal">Personal</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Food & Dining">Food & Dining</MenuItem>
              <MenuItem value="Transportation">Transportation</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Office Supplies">Office Supplies</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Travel">Travel</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Amount"
              value={amountRange.min}
              onChange={(e) => setAmountRange((prev) => ({ ...prev, min: e.target.value }))}
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Amount"
              value={amountRange.max}
              onChange={(e) => setAmountRange((prev) => ({ ...prev, max: e.target.value }))}
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <CsvUploader
              onUploadComplete={handleUploadComplete}
              uploadUrl="/api/transactions/upload"
            />
          </Grid>
        </Grid>
      </Paper>

      <TransactionList
        transactions={transactions}
        loading={isLoading}
        onEdit={handleEdit}
        onReceiptClick={handleReceiptClick}
        onAICategorize={handleAICategorize}
      />
    </Box>
  );
}

function isValidDate(date: any): boolean {
  return !Number.isNaN(Date.parse(date));
}
