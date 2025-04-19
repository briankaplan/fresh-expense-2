import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { SearchAndFilter, FilterOption } from './SearchAndFilter';
import { ExpenseRow } from './ExpenseRow';
import { LoadingSkeleton } from './LoadingSkeleton';
import { formatCurrency, formatDate } from '@/utils/format';
import ExpenseService, { ExpenseFilter } from '@/services/expense.service';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  status: string;
}

interface ExpensesListProps {
  initialExpenses?: Expense[];
  pageSize?: number;
}

type SortField = 'date' | 'amount' | 'description' | 'category' | 'merchant' | 'status';
type SortOrder = 'asc' | 'desc';

export function ExpensesList({ initialExpenses = [], pageSize = 20 }: ExpensesListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categories, setCategories] = useState<string[]>([]);
  const [merchants, setMerchants] = useState<string[]>([]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const expenseService = ExpenseService.getInstance();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filterParams: ExpenseFilter = {
        search: searchTerm,
        ...filters,
        sortField,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      };

      const response = await expenseService.getExpenses(filterParams);
      setExpenses(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, sortField, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await expenseService.getCategories();
      setCategories(categories);
    };
    const loadMerchants = async () => {
      const merchants = await expenseService.getMerchants();
      setMerchants(merchants);
    };
    loadCategories();
    loadMerchants();
  }, []);

  const filterOptions: FilterOption[] = [
    {
      label: 'Category',
      value: 'category',
      type: 'select',
      options: categories.map(cat => ({ label: cat, value: cat })),
    },
    {
      label: 'Status',
      value: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      label: 'Merchant',
      value: 'merchant',
      type: 'select',
      options: merchants.map(merch => ({ label: merch, value: merch })),
    },
    {
      label: 'Min Amount',
      value: 'minAmount',
      type: 'number',
    },
    {
      label: 'Max Amount',
      value: 'maxAmount',
      type: 'number',
    },
    {
      label: 'Start Date',
      value: 'startDate',
      type: 'date',
    },
    {
      label: 'End Date',
      value: 'endDate',
      type: 'date',
    },
  ];

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const filterParams: ExpenseFilter = {
        search: searchTerm,
        ...filters,
        sortField,
        sortOrder,
      };

      const blob = await expenseService.exportExpenses(filterParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${formatDate(new Date())}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  if (isLoading && !expenses.length) {
    return <LoadingSkeleton />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <SearchAndFilter
          onSearch={setSearchTerm}
          onFilter={setFilters}
          filterOptions={filterOptions}
          placeholder="Search expenses..."
        />
        <IconButton onClick={handleExportMenuClick}>
          <DownloadIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleExport('csv');
            handleExportMenuClose();
          }}
        >
          Export as CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleExport('excel');
            handleExportMenuClose();
          }}
        >
          Export as Excel
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleExport('pdf');
            handleExportMenuClose();
          }}
        >
          Export as PDF
        </MenuItem>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'date'}
                  direction={sortField === 'date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'description'}
                  direction={sortField === 'description' ? sortOrder : 'asc'}
                  onClick={() => handleSort('description')}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'amount'}
                  direction={sortField === 'amount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'category'}
                  direction={sortField === 'category' ? sortOrder : 'asc'}
                  onClick={() => handleSort('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'merchant'}
                  direction={sortField === 'merchant' ? sortOrder : 'asc'}
                  onClick={() => handleSort('merchant')}
                >
                  Merchant
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map(expense => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
            {expenses.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No expenses found</Typography>
                </TableCell>
              </TableRow>
            )}
            {isLoading && expenses.length > 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalCount > pageSize && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(totalCount / pageSize)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
