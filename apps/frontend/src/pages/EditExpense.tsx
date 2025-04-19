import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import ExpenseForm from '@/shared/components/ExpenseForm';

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Expense
      </Typography>
      <Paper sx={{ p: 2 }}>
        <ExpenseForm expenseId={id} />
      </Paper>
    </Box>
  );
};

export default EditExpense;
