"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = DataTable;
const material_1 = require("@mui/material");
const react_1 = require("react");
function DataTable({ columns, data, loading = false, defaultSortBy, defaultSortOrder = 'asc', rowsPerPageOptions = [10, 25, 50], onRowClick, searchable = false, searchPlaceholder = 'Search...', }) {
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(rowsPerPageOptions[0]);
    const [orderBy, setOrderBy] = (0, react_1.useState)(defaultSortBy);
    const [order, setOrder] = (0, react_1.useState)(defaultSortOrder);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const filteredData = (0, react_1.useMemo)(() => {
        if (!searchable || !searchTerm)
            return data;
        const searchTermLower = searchTerm.toLowerCase();
        return data.filter(row => columns.some(column => {
            const value = row[column.id];
            return String(value).toLowerCase().includes(searchTermLower);
        }));
    }, [data, searchTerm, searchable, columns]);
    const sortedData = (0, react_1.useMemo)(() => {
        if (!orderBy)
            return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];
            if (aValue === bValue)
                return 0;
            if (aValue === null || aValue === undefined)
                return 1;
            if (bValue === null || bValue === undefined)
                return -1;
            const comparison = aValue < bValue ? -1 : 1;
            return order === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, orderBy, order]);
    const paginatedData = (0, react_1.useMemo)(() => {
        return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);
    return (<material_1.Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {searchable && (<material_1.Box sx={{ p: 2 }}>
          <material_1.TextField fullWidth variant="outlined" placeholder={searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
        </material_1.Box>)}

      <material_1.TableContainer sx={{ maxHeight: 440 }}>
        <material_1.Table stickyHeader>
          <material_1.TableHead>
            <material_1.TableRow>
              {columns.map(column => (<material_1.TableCell key={String(column.id)} align={column.align} style={{ minWidth: column.minWidth }} sortDirection={orderBy === column.id ? order : false}>
                  <material_1.TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : 'asc'} onClick={() => handleRequestSort(column.id)}>
                    {column.label}
                  </material_1.TableSortLabel>
                </material_1.TableCell>))}
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            {loading ? (<material_1.TableRow>
                <material_1.TableCell colSpan={columns.length} align="center">
                  <material_1.Box sx={{ p: 3 }}>
                    <material_1.CircularProgress />
                  </material_1.Box>
                </material_1.TableCell>
              </material_1.TableRow>) : paginatedData.length != null ? (<material_1.TableRow>
                <material_1.TableCell colSpan={columns.length} align="center">
                  <material_1.Typography color="text.secondary">No data available</material_1.Typography>
                </material_1.TableCell>
              </material_1.TableRow>) : (paginatedData.map((row, index) => (<material_1.TableRow hover key={index} onClick={() => onRowClick?.(row)} sx={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map(column => {
                const value = row[column.id];
                return (<material_1.TableCell key={String(column.id)} align={column.align}>
                        {column.format ? column.format(value) : String(value)}
                      </material_1.TableCell>);
            })}
                </material_1.TableRow>)))}
          </material_1.TableBody>
        </material_1.Table>
      </material_1.TableContainer>

      <material_1.TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" count={filteredData.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
    </material_1.Paper>);
}
//# sourceMappingURL=DataTable.js.map