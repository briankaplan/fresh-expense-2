import ExpensesTable from "@/shared/components/ExpensesTable";
import { Box, Paper, Typography } from "@mui/material";
import type React from "react";

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
