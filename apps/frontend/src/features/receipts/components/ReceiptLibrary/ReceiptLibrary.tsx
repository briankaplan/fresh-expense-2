import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  FilterList,
  Search,
  Download,
  Delete,
  Link,
  Unlink,
  MoreVert,
  CloudDownload,
  Visibility,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { DataTable } from '@fresh-expense/ui';
import { ReceiptService } from '../../../../services/receipt.service';
import { toast } from 'react-toastify';
import { Receipt } from '@fresh-expense/types';

interface ReceiptLibraryProps {
  company?: string;
}

export const ReceiptLibrary: React.FC<ReceiptLibraryProps> = ({ company }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchReceipts();
  }, [company, statusFilter, dateRange]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (company) queryParams.append('company', company);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (dateRange.start) queryParams.append('startDate', dateRange.start.toISOString());
      if (dateRange.end) queryParams.append('endDate', dateRange.end.toISOString());

      const response = await ReceiptService.getReceipts(queryParams.toString());
      setReceipts(response);
    } catch (error) {
      toast.error('Failed to fetch receipts');
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    setDateRange(prev => ({ ...prev, [field]: date }));
  };

  const handleBulkDownload = async () => {
    try {
      setLoading(true);
      const selectedReceiptsData = receipts.filter(r => selectedReceipts.includes(r.id));
      await ReceiptService.downloadReceipts(selectedReceiptsData);
      toast.success('Receipts downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipts');
      console.error('Error downloading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedReceipts.map(id => ReceiptService.deleteReceipt(id)));
      await fetchReceipts();
      toast.success('Receipts deleted successfully');
    } catch (error) {
      toast.error('Failed to delete receipts');
      console.error('Error deleting receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'filename',
      headerName: 'Filename',
      flex: 1,
      renderCell: (params: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>{params.value}</Typography>
          {params.row.status != null && (
            <Chip label="Unmatched" color="warning" size="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={
            params.value != null
              ? 'success'
              : params.value != null
                ? 'warning'
                : params.value != null
                  ? 'info'
                  : 'error'
          }
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Upload Date',
      width: 150,
      renderCell: (params: any) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: any) => (
        <Box>
          <Tooltip title="Download">
            <IconButton onClick={() => ReceiptService.downloadReceipt(params.row.id)} size="small">
              <CloudDownload />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleViewDetails(params.row)} size="small">
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton onClick={e => handleMenuOpen(e, params.row)} size="small">
              <MoreVert />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search />,
                }}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={handleStatusFilter} label="Status">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="matched">Matched</MenuItem>
                  <MenuItem value="unmatched">Unmatched</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={date => handleDateRangeChange('start', date)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={date => handleDateRangeChange('end', date)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                {selectedReceipts.length > 0
                  ? `${selectedReceipts.length} selected`
                  : `${receipts.length} receipts`}
              </Typography>
              <Box>
                {selectedReceipts.length > 0 && (
                  <>
                    <Button
                      startIcon={<Download />}
                      onClick={handleBulkDownload}
                      disabled={loading}
                    >
                      Download Selected
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      onClick={handleBulkDelete}
                      disabled={loading}
                      color="error"
                    >
                      Delete Selected
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <DataTable
              rows={receipts}
              columns={columns}
              loading={loading}
              checkboxSelection
              onSelectionModelChange={newSelection => {
                setSelectedReceipts(newSelection as string[]);
              }}
              selectionModel={selectedReceipts}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
