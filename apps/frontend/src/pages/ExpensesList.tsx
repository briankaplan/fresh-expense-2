import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ExpensesTable from '@/shared/components/ExpensesTable';

const ExpensesList: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>
      <Paper sx={{ p: 2 }}>
        <ExpensesTable />
      </Paper>
    </Box>
  );
};

export default ExpensesList;
