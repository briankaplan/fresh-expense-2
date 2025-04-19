import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Column } from '@fresh-expense/types/src';

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  sortable?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  sortable = false,
  onRowClick,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedData = orderBy
    ? [...filteredData].sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        return (String(aValue) < String(bValue) ? -1 : 1) * (order === 'asc' ? 1 : -1);
      })
    : filteredData;

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {searchable && (
        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id as keyof T)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map(column => (
                  <TableCell key={String(column.id)} align={column.align}>
                    {column.format
                      ? column.format(row[column.id as keyof T])
                      : String(row[column.id as keyof T] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
