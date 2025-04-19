"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const react_router_dom_1 = require("react-router-dom");
const ExpensesTable = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
    const [expandedRow, setExpandedRow] = (0, react_1.useState)(null);
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
    // Mock data - replace with actual API call
    const expenses = [
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
            amount: 2000.0,
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
    const handlePageChange = (_event, newPage) => {
        setPage(newPage);
    };
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    const getStatusColor = (status) => {
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
    const handleEdit = (id) => {
        navigate(`/expenses/edit/${id}`);
    };
    const handleDelete = (id) => {
        // TODO: Implement delete functionality
        console.log('Deleting expense:', id);
    };
    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };
    const MobileExpenseCard = ({ expense }) => (<material_1.Card sx={{
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
                bgcolor: 'action.hover',
            },
        }} onClick={() => toggleRow(expense.id)}>
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <material_1.Typography variant="subtitle1" component="div">
            {expense.description}
          </material_1.Typography>
          <material_1.Typography variant="h6" color="primary">
            {formatCurrency(expense.amount)}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <material_1.Typography variant="body2" color="text.secondary">
            {new Date(expense.date).toLocaleDateString()}
          </material_1.Typography>
          <material_1.Chip label={expense.category} size="small" sx={{ ml: 1 }}/>
          <material_1.Chip label={expense.status} color={getStatusColor(expense.status)} size="small"/>
        </material_1.Stack>

        <material_1.Collapse in={expandedRow === expense.id}>
          <material_1.Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <material_1.IconButton size="small" onClick={e => {
            e.stopPropagation();
            handleEdit(expense.id);
        }}>
              <Edit_1.default />
            </material_1.IconButton>
            <material_1.IconButton size="small" onClick={e => {
            e.stopPropagation();
            handleDelete(expense.id);
        }}>
              <Delete_1.default />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.Collapse>
      </material_1.CardContent>
    </material_1.Card>);
    if (isMobile) {
        return (<material_1.Box>
        <material_1.Box sx={{ p: 2 }}>
          {expenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(expense => (<MobileExpenseCard key={expense.id} expense={expense}/>))}
        </material_1.Box>
        <material_1.TablePagination component="div" count={expenses.length} page={page} onPageChange={handlePageChange} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleRowsPerPageChange} sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontSize: '0.875rem',
                },
            }}/>
      </material_1.Box>);
    }
    return (<material_1.Box>
      <material_1.TableContainer>
        <material_1.Table>
          <material_1.TableHead>
            <material_1.TableRow>
              <material_1.TableCell>Date</material_1.TableCell>
              <material_1.TableCell>Description</material_1.TableCell>
              <material_1.TableCell>Category</material_1.TableCell>
              <material_1.TableCell align="right">Amount</material_1.TableCell>
              <material_1.TableCell>Status</material_1.TableCell>
              <material_1.TableCell align="right">Actions</material_1.TableCell>
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            {expenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(expense => (<material_1.TableRow key={expense.id} sx={{
                '&:hover': {
                    bgcolor: 'action.hover',
                },
            }}>
                <material_1.TableCell>{new Date(expense.date).toLocaleDateString()}</material_1.TableCell>
                <material_1.TableCell>{expense.description}</material_1.TableCell>
                <material_1.TableCell>
                  <material_1.Chip label={expense.category} size="small"/>
                </material_1.TableCell>
                <material_1.TableCell align="right">{formatCurrency(expense.amount)}</material_1.TableCell>
                <material_1.TableCell>
                  <material_1.Chip label={expense.status} color={getStatusColor(expense.status)} size="small"/>
                </material_1.TableCell>
                <material_1.TableCell align="right">
                  <material_1.IconButton size="small" onClick={() => handleEdit(expense.id)} sx={{ mr: 1 }}>
                    <Edit_1.default />
                  </material_1.IconButton>
                  <material_1.IconButton size="small" onClick={() => handleDelete(expense.id)}>
                    <Delete_1.default />
                  </material_1.IconButton>
                </material_1.TableCell>
              </material_1.TableRow>))}
          </material_1.TableBody>
        </material_1.Table>
      </material_1.TableContainer>
      <material_1.TablePagination component="div" count={expenses.length} page={page} onPageChange={handlePageChange} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleRowsPerPageChange}/>
    </material_1.Box>);
};
exports.default = ExpensesTable;
//# sourceMappingURL=ExpensesTable.js.map