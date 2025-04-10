import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  ClickAwayListener,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: string;
}

interface EditableCell {
  rowId: string;
  field: keyof Transaction;
}

const Transactions: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock data - replace with actual API call
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-04-08',
      description: 'Grocery Store',
      amount: -125.50,
      category: 'Food',
      type: 'expense',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-04-01',
      description: 'Salary Deposit',
      amount: 4500.00,
      category: 'Income',
      type: 'income',
      status: 'completed'
    },
    // Add more mock transactions as needed
  ];

  const categories = ['Food', 'Income', 'Transportation', 'Entertainment', 'Bills'];

  const handleChangePage = (event: unknown, newPage: number) => {
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

  const handleDateChange = (date: Date | null, setter: (date: Date | null) => void) => {
    setter(date);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || transaction.category === category;
    const matchesDateRange = (!startDate || new Date(transaction.date) >= startDate) &&
      (!endDate || new Date(transaction.date) <= endDate);

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleStartEdit = (transaction: Transaction, field: keyof Transaction) => {
    setEditingCell({ rowId: transaction.id, field });
    setEditValue(String(transaction[field]));
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSaveEdit = async (transaction: Transaction) => {
    if (!editingCell) return;

    try {
      setIsSubmitting(true);
      
      let value: string | number = editValue;
      if (editingCell.field === 'amount') {
        value = parseFloat(editValue.replace(/[^0-9.-]+/g, ''));
        if (isNaN(value)) {
          toast.error('Please enter a valid amount');
          return;
        }
      }

      // API call to update the transaction
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [editingCell.field]: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      // Update local state
      const updatedTransactions = transactions.map(t => {
        if (t.id === transaction.id) {
          return { ...t, [editingCell.field]: value };
        }
        return t;
      });
      // Update your transactions state here
      // setTransactions(updatedTransactions);

      toast.success('Transaction updated successfully');
      handleCancelEdit();
    } catch (error) {
      toast.error('Failed to update transaction');
      console.error('Error updating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const EditableContent = ({ 
    transaction, 
    field 
  }: { 
    transaction: Transaction; 
    field: keyof Transaction;
  }) => {
    const isEditing = editingCell?.rowId === transaction.id && editingCell?.field === field;

    if (!isEditing) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            cursor: 'pointer',
            '&:hover .edit-icon': {
              opacity: 1,
            },
          }}
          onClick={() => handleStartEdit(transaction, field)}
        >
          {field === 'amount' ? (
            formatCurrency(transaction[field] as number)
          ) : field === 'category' ? (
            <Chip label={transaction[field]} size="small" />
          ) : (
            transaction[field]
          )}
          <EditIcon 
            className="edit-icon" 
            sx={{ 
              fontSize: 16, 
              opacity: 0,
              transition: 'opacity 0.2s',
              color: 'text.secondary',
            }} 
          />
        </Box>
      );
    }

    return (
      <ClickAwayListener onClickAway={handleCancelEdit}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            variant="outlined"
            InputProps={field === 'amount' ? {
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            } : undefined}
            sx={{ minWidth: field === 'amount' ? 120 : 200 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(transaction);
              }
            }}
          />
          <IconButton 
            size="small" 
            onClick={() => handleSaveEdit(transaction)}
            disabled={isSubmitting}
            color="primary"
          >
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleCancelEdit}
            disabled={isSubmitting}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </ClickAwayListener>
    );
  };

  const MobileTransactionCard = ({ transaction, index }: { transaction: Transaction; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <EditableContent transaction={transaction} field="description" />
            <EditableContent transaction={transaction} field="amount" />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {new Date(transaction.date).toLocaleDateString()}
            </Typography>
            <EditableContent transaction={transaction} field="category" />
            <Chip
              label={transaction.status}
              size="small"
              color={transaction.status === 'completed' ? 'success' : 'warning'}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <AnimatedWrapper>
      <Box sx={{ p: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}>
            <Typography variant="h4" gutterBottom={isMobile}>
              Transactions
            </Typography>
            <Button
              fullWidth={isMobile}
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters {filterOpen ? '▼' : '▲'}
            </Button>
          </Box>
        </motion.div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Search transactions"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid item xs={12} sm={6} md={2}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(date) => handleDateChange(date, setStartDate)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            size: isMobile ? "small" : "medium"
                          } 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(date) => handleDateChange(date, setEndDate)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            size: isMobile ? "small" : "medium"
                          } 
                        }}
                      />
                    </Grid>
                  </LocalizationProvider>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm('');
                        setCategory('');
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile View */}
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Box>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction, index) => (
                  <MobileTransactionCard 
                    key={transaction.id} 
                    transaction={transaction}
                    index={index}
                  />
                ))}
            </Box>
          </motion.div>
        ) : (
          /* Desktop Table View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TableContainer 
              component={Paper}
              sx={{
                overflowX: 'auto',
                '.MuiTable-root': {
                  minWidth: 750
                }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ 
                          display: 'table-row',
                        }}
                      >
                        <TableCell>
                          <EditableContent transaction={transaction} field="date" />
                        </TableCell>
                        <TableCell>
                          <EditableContent transaction={transaction} field="description" />
                        </TableCell>
                        <TableCell>
                          <EditableContent transaction={transaction} field="category" />
                        </TableCell>
                        <TableCell align="right">
                          <EditableContent transaction={transaction} field="amount" />
                        </TableCell>
                        <TableCell>
                          <EditableContent transaction={transaction} field="status" />
                        </TableCell>
                      </motion.tr>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          />
        </motion.div>
      </Box>
    </AnimatedWrapper>
  );
};

export default Transactions; 