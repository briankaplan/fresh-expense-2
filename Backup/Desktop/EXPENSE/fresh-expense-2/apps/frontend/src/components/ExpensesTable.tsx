import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  Collapse,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const ExpensesTable: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock data - replace with actual API call
  const expenses: Expense[] = [
    {
      id: '1',
      date: '2024-03-20',
      description: 'Grocery Shopping',
      amount: 156.78,
      category: 'Groceries',
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-03-19',
      description: 'Monthly Rent',
      amount: 2000.00,
      category: 'Housing',
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-03-18',
      description: 'Gas Station',
      amount: 45.67,
      category: 'Transportation',
      status: 'pending',
    },
  ];

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/expenses/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Deleting expense:', id);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const MobileExpenseCard = ({ expense }: { expense: Expense }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={() => toggleRow(expense.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" component="div">
            {expense.description}
          </Typography>
          <Typography variant="h6" color="primary">
            {formatCurrency(expense.amount)}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {new Date(expense.date).toLocaleDateString()}
          </Typography>
          <Chip
            label={expense.category}
            size="small"
            sx={{ ml: 1 }}
          />
          <Chip
            label={expense.status}
            color={getStatusColor(expense.status)}
            size="small"
          />
        </Stack>

        <Collapse in={expandedRow === expense.id}>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(expense.id);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(expense.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Box>
        <Box sx={{ p: 2 }}>
          {expenses
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((expense) => (
              <MobileExpenseCard key={expense.id} expense={expense} />
            ))}
        </Box>
        <TablePagination
          component="div"
          count={expenses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((expense) => (
                <TableRow 
                  key={expense.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Chip label={expense.category} size="small" />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.status}
                      color={getStatusColor(expense.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(expense.id)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={expenses.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default ExpensesTable; 