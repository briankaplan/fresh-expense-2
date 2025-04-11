import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Tooltip,
  Collapse,
  ClickAwayListener,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Add as AddIcon,
  AutoFixHigh as AIIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CsvUploader } from '../components/CsvUploader';

interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  description: string;
  tags: string[];
  company: 'Down Home' | 'Music City Rodeo' | 'Personal';
  receiptUrl?: string;
  aiSuggestions?: {
    category?: string;
    description?: string;
    tags?: string[];
  };
  status: string;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Office Supplies',
  'Marketing',
  'Software',
  'Travel',
  'Other',
];

const companies = ['Down Home', 'Music City Rodeo', 'Personal'];

interface EditableCell {
  rowId: string;
  field: keyof Expense;
}

export const Expenses: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      currency: 'USD',
    }).format(amount);
  };

  const handleStartEdit = (expense: Expense, field: keyof Expense) => {
    setEditingCell({ rowId: expense.id, field });
    setEditValue(String(expense[field]));
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSaveEdit = async (expense: Expense) => {
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

      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [editingCell.field]: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      // Update local state
      const updatedExpenses = expenses.map(e => {
        if (e.id === expense.id) {
          return { ...e, [editingCell.field]: value };
        }
        return e;
      });
      setExpenses(updatedExpenses);

      toast.success('Expense updated successfully');
      handleCancelEdit();
    } catch (error) {
      toast.error('Failed to update expense');
      console.error('Error updating expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const EditableContent = ({ 
    expense, 
    field 
  }: { 
    expense: Expense; 
    field: keyof Expense;
  }) => {
    const isEditing = editingCell?.rowId === expense.id && editingCell?.field === field;

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
          onClick={() => handleStartEdit(expense, field)}
        >
          {field === 'amount' ? (
            formatCurrency(expense[field] as number)
          ) : field === 'category' ? (
            <Chip label={expense[field]} size="small" />
          ) : field === 'aiSuggestions' ? (
            <Box>
              {expense.aiSuggestions?.category && (
                <Chip label={`Category: ${expense.aiSuggestions.category}`} size="small" sx={{ mr: 1 }} />
              )}
              {expense.aiSuggestions?.description && (
                <Typography variant="body2" component="span">
                  {expense.aiSuggestions.description}
                </Typography>
              )}
              {expense.aiSuggestions?.tags && expense.aiSuggestions.tags.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {expense.aiSuggestions.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            expense[field]
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
                handleSaveEdit(expense);
              }
            }}
          />
          <IconButton 
            size="small" 
            onClick={() => handleSaveEdit(expense)}
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      const matchesCompany = !selectedCompany || expense.company === selectedCompany;
      
      const matchesDateRange = (!dateRange.start || new Date(expense.date) >= dateRange.start) &&
        (!dateRange.end || new Date(expense.date) <= dateRange.end);

      const matchesAmount = (!amountRange.min || expense.amount >= parseFloat(amountRange.min)) &&
        (!amountRange.max || expense.amount <= parseFloat(amountRange.max));

      return matchesSearch && matchesCategory && matchesCompany && matchesDateRange && matchesAmount;
    });
  }, [expenses, searchTerm, selectedCategory, selectedCompany, dateRange, amountRange]);

  const handleUploadComplete = () => {
    // Refresh the expenses list
    // You'll need to implement this based on your data fetching logic
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleStartDateChange = (date: Date | null) => {
    setDateRange(prev => ({ ...prev, start: date }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setDateRange(prev => ({ ...prev, end: date }));
  };

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountRange(prev => ({ ...prev, min: value }));
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountRange(prev => ({ ...prev, max: value }));
  };

  return (
    <Box>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
      }}>
        <Typography variant="h5">Expenses</Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            fullWidth={isMobile}
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filters {filterOpen ? '▼' : '▲'}
          </Button>
          <Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* Handle add expense */}}
          >
            Add Expense
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Collapse in={filterOpen}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Category"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company} value={company}>
                    {company}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={handleStartDateChange}
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
                  value={dateRange.end}
                  onChange={handleEndDateChange}
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
              <TextField
                fullWidth
                type="number"
                label="Min Amount"
                value={amountRange.min}
                onChange={handleMinAmountChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Max Amount"
                value={amountRange.max}
                onChange={handleMaxAmountChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Expenses Table */}
      <TableContainer 
        component={Paper}
        sx={{
          overflowX: 'auto',
          '.MuiTable-root': {
            minWidth: { xs: 'auto', sm: 750 }
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Merchant</TableCell>
              {!isMobile && <TableCell>Description</TableCell>}
              <TableCell>Category</TableCell>
              {!isMobile && <TableCell>Company</TableCell>}
              <TableCell align="right">Amount</TableCell>
              {!isMobile && <TableCell>Receipt</TableCell>}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: page * rowsPerPage + filteredExpenses.indexOf(expense) * 0.05 }}
                >
                  <TableCell>
                    <EditableContent expense={expense} field="date" />
                  </TableCell>
                  <TableCell>{expense.merchant}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Box>
                        <EditableContent expense={expense} field="description" />
                        <Box sx={{ mt: 0.5 }}>
                          {expense.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    <EditableContent expense={expense} field="category" />
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Chip
                        label={expense.company}
                        size="small"
                        color={
                          expense.company === 'Personal' ? 'primary' :
                          expense.company === 'Down Home' ? 'success' : 'warning'
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <EditableContent expense={expense} field="amount" />
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      {expense.receiptUrl && (
                        <Tooltip title="View Receipt">
                          <IconButton size="small" onClick={() => {/* Handle receipt view */}}>
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {!isMobile && expense.aiSuggestions && (
                        <Tooltip title="AI Suggestions Available">
                          <IconButton size="small" color="secondary">
                            <AIIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </motion.tr>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredExpenses.length}
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
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Expenses
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <CsvUploader 
              type="expenses" 
              onUploadComplete={handleUploadComplete}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}; 