import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ExpenseForm from '@/shared/components/ExpenseForm';

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
