import ExpenseForm from "@/shared/components/ExpenseForm";
import { Box, Paper, Typography } from "@mui/material";
import type React from "react";

const AddExpense: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Expense
      </Typography>
      <Paper sx={{ p: 2 }}>
        <ExpenseForm />
      </Paper>
    </Box>
  );
};

export default AddExpense;
