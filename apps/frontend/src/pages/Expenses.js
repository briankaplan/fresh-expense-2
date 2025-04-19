const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expenses = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const styles_1 = require("@mui/material/styles");
const react_hot_toast_1 = require("react-hot-toast");
const CsvUploader_1 = require("@/shared/components/CsvUploader");
const BulkActions_1 = require("@/components/BulkActions");
const expense_service_1 = __importDefault(require("@/services/expense.service"));
const categories = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Office Supplies",
  "Marketing",
  "Software",
  "Travel",
  "Other",
];
const companies = ["Down Home", "Music City Rodeo", "Personal"];
const Expenses = () => {
  const [page, setPage] = (0, react_1.useState)(0);
  const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
  const [filterOpen, setFilterOpen] = (0, react_1.useState)(false);
  const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
  const [selectedCategory, setSelectedCategory] = (0, react_1.useState)("");
  const [selectedCompany, setSelectedCompany] = (0, react_1.useState)("");
  const [dateRange, setDateRange] = (0, react_1.useState)({
    start: null,
    end: null,
  });
  const [expenses, setExpenses] = (0, react_1.useState)([]);
  const [editingCell, setEditingCell] = (0, react_1.useState)(null);
  const [editValue, setEditValue] = (0, react_1.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
  const [amountRange, setAmountRange] = (0, react_1.useState)({
    min: "",
    max: "",
  });
  const [selectedExpenses, setSelectedExpenses] = (0, react_1.useState)([]);
  const theme = (0, styles_1.useTheme)();
  const expenseService = expense_service_1.default.getInstance();
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  const handleStartEdit = (expense, field) => {
    setEditingCell({ rowId: expense.id, field });
    setEditValue(String(expense[field]));
  };
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };
  const handleSaveEdit = async (expense) => {
    if (!editingCell) return;
    try {
      setIsSubmitting(true);
      let value = editValue;
      if (editingCell.field === "amount") {
        value = Number.parseFloat(editValue.replace(/[^0-9.-]+/g, ""));
        if (Number.isNaN(value)) {
          react_hot_toast_1.toast.error("Please enter a valid amount");
          return;
        }
      }
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [editingCell.field]: value,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update expense");
      }
      // Update local state
      const updatedExpenses = expenses.map((e) => {
        if (e.id === expense.id) {
          return { ...e, [editingCell.field]: value };
        }
        return e;
      });
      setExpenses(updatedExpenses);
      react_hot_toast_1.toast.success("Expense updated successfully");
      handleCancelEdit();
    } catch (error) {
      react_hot_toast_1.toast.error("Failed to update expense");
      console.error("Error updating expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const EditableContent = ({ expense, field }) => {
    const isEditing = editingCell?.rowId === expense.id && editingCell?.field === field;
    if (!isEditing) {
      return (
        <material_1.Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            "&:hover .edit-icon": {
              opacity: 1,
            },
          }}
          onClick={() => handleStartEdit(expense, field)}
        >
          {field === "amount" ? (
            formatCurrency(expense[field])
          ) : field === "category" ? (
            <material_1.Chip label={expense[field]} size="small" />
          ) : field === "aiSuggestions" ? (
            <material_1.Box>
              {expense.aiSuggestions?.category && (
                <material_1.Chip
                  label={`Category: ${expense.aiSuggestions.category}`}
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {expense.aiSuggestions?.description && (
                <material_1.Typography variant="body2" component="span">
                  {expense.aiSuggestions.description}
                </material_1.Typography>
              )}
              {expense.aiSuggestions?.tags && expense.aiSuggestions.tags.length > 0 && (
                <material_1.Box sx={{ mt: 1 }}>
                  {expense.aiSuggestions.tags.map((tag, index) => (
                    <material_1.Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </material_1.Box>
              )}
            </material_1.Box>
          ) : (
            expense[field]
          )}
          <icons_material_1.Edit
            className="edit-icon"
            sx={{
              fontSize: 16,
              opacity: 0,
              transition: "opacity 0.2s",
              color: "text.secondary",
            }}
          />
        </material_1.Box>
      );
    }
    return (
      <material_1.ClickAwayListener onClickAway={handleCancelEdit}>
        <material_1.Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <material_1.TextField
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            variant="outlined"
            InputProps={
              field === "amount"
                ? {
                    startAdornment: (
                      <material_1.InputAdornment position="start">$</material_1.InputAdornment>
                    ),
                  }
                : undefined
            }
            sx={{ minWidth: field === "amount" ? 120 : 200 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit(expense);
              }
            }}
          />
          <material_1.IconButton
            size="small"
            onClick={() => handleSaveEdit(expense)}
            disabled={isSubmitting}
            color="primary"
          >
            <icons_material_1.Save fontSize="small" />
          </material_1.IconButton>
          <material_1.IconButton size="small" onClick={handleCancelEdit} disabled={isSubmitting}>
            <icons_material_1.Close fontSize="small" />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.ClickAwayListener>
    );
  };
  const filteredExpenses = (0, react_1.useMemo)(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      const matchesCompany = !selectedCompany || expense.company === selectedCompany;
      const matchesDateRange =
        (!dateRange.start || new Date(expense.date) >= dateRange.start) &&
        (!dateRange.end || new Date(expense.date) <= dateRange.end);
      const matchesAmount =
        (!amountRange.min || expense.amount >= Number.parseFloat(amountRange.min)) &&
        (!amountRange.max || expense.amount <= Number.parseFloat(amountRange.max));
      return (
        matchesSearch && matchesCategory && matchesCompany && matchesDateRange && matchesAmount
      );
    });
  }, [expenses, searchTerm, selectedCategory, selectedCompany, dateRange, amountRange]);
  const handleUploadComplete = () => {
    // Refresh the expenses list
    // You'll need to implement this based on your data fetching logic
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  const handleStartDateChange = (date) => {
    setDateRange((prev) => ({ ...prev, start: date }));
  };
  const handleEndDateChange = (date) => {
    setDateRange((prev) => ({ ...prev, end: date }));
  };
  const handleMinAmountChange = (e) => {
    const value = e.target.value;
    setAmountRange((prev) => ({ ...prev, min: value }));
  };
  const handleMaxAmountChange = (e) => {
    const value = e.target.value;
    setAmountRange((prev) => ({ ...prev, max: value }));
  };
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedExpenses(filteredExpenses);
    } else {
      setSelectedExpenses([]);
    }
  };
  const handleSelectExpense = (expense) => {
    setSelectedExpenses((prev) => {
      const isSelected = prev.some((e) => e.id === expense.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== expense.id);
      }
      return [...prev, expense];
    });
  };
  const handleBulkDelete = async (expenseIds) => {
    try {
      await expenseService.bulkDeleteExpenses(expenseIds);
      setSelectedExpenses([]);
      // Refresh the expenses list
      const response = await expenseService.getExpenses({
        page: page,
        limit: rowsPerPage,
        ...{
          searchTerm,
          selectedCategory,
          selectedCompany,
          dateRange: {
            start: dateRange.start,
            end: dateRange.end,
          },
          amountRange: {
            min: amountRange.min,
            max: amountRange.max,
          },
        },
      });
      setExpenses(response.items);
    } catch (error) {
      console.error("Error deleting expenses:", error);
      // TODO: Show error toast
    }
  };
  const handleBulkEdit = async (expenseIds) => {
    try {
      // TODO: Open bulk edit dialog
      const updates = {
        // Get updates from dialog
      };
      const updatedExpenses = await expenseService.bulkUpdateExpenses(expenseIds, updates);
      setSelectedExpenses([]);
      // Update the expenses list with the new data
      setExpenses((prev) =>
        prev.map((expense) => {
          const updated = updatedExpenses.find((e) => e.id === expense.id);
          return updated || expense;
        }),
      );
    } catch (error) {
      console.error("Error updating expenses:", error);
      // TODO: Show error toast
    }
  };
  const handleBulkLabel = async (expenseIds, label) => {
    try {
      const updatedExpenses = await expenseService.bulkAddLabel(expenseIds, label);
      setSelectedExpenses([]);
      // Update the expenses list with the new data
      setExpenses((prev) =>
        prev.map((expense) => {
          const updated = updatedExpenses.find((e) => e.id === expense.id);
          return updated || expense;
        }),
      );
    } catch (error) {
      console.error("Error labeling expenses:", error);
      // TODO: Show error toast
    }
  };
  const handleBulkShare = async (expenseIds) => {
    try {
      const { shareUrl } = await expenseService.bulkShareExpenses(expenseIds);
      // TODO: Show share dialog with URL
      console.log("Share URL:", shareUrl);
      setSelectedExpenses([]);
    } catch (error) {
      console.error("Error sharing expenses:", error);
      // TODO: Show error toast
    }
  };
  return (
    <material_1.Box>
      <material_1.Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <material_1.Typography variant="h5">Expenses</material_1.Typography>
        <material_1.Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {selectedExpenses.length > 0 && (
            <BulkActions_1.BulkActions
              selectedExpenses={selectedExpenses}
              onDelete={handleBulkDelete}
              onEdit={handleBulkEdit}
              onLabel={handleBulkLabel}
              onShare={handleBulkShare}
            />
          )}
          <material_1.Button
            fullWidth={isMobile}
            variant="outlined"
            startIcon={<icons_material_1.FilterList />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filters {filterOpen ? "▼" : "▲"}
          </material_1.Button>
          <material_1.Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={<icons_material_1.Add />}
            onClick={() => {
              /* Handle add expense */
            }}
          >
            Add Expense
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {/* Filters */}
      <material_1.Collapse in={filterOpen}>
        <material_1.Paper sx={{ p: 2, mb: 3 }}>
          <material_1.Grid container spacing={2} alignItems="center">
            <material_1.Grid item xs={12} md={4}>
              <material_1.TextField
                fullWidth
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <icons_material_1.Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.TextField
                select
                fullWidth
                label="Category"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <material_1.MenuItem value="">All Categories</material_1.MenuItem>
                {categories.map((category) => (
                  <material_1.MenuItem key={category} value={category}>
                    {category}
                  </material_1.MenuItem>
                ))}
              </material_1.TextField>
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.TextField
                select
                fullWidth
                label="Company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <material_1.MenuItem value="">All Companies</material_1.MenuItem>
                {companies.map((company) => (
                  <material_1.MenuItem key={company} value={company}>
                    {company}
                  </material_1.MenuItem>
                ))}
              </material_1.TextField>
            </material_1.Grid>
            <LocalizationProvider_1.LocalizationProvider
              dateAdapter={AdapterDateFns_1.AdapterDateFns}
            >
              <material_1.Grid item xs={12} sm={6} md={2}>
                <DatePicker_1.DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: isMobile ? "small" : "medium",
                    },
                  }}
                />
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={2}>
                <DatePicker_1.DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: isMobile ? "small" : "medium",
                    },
                  }}
                />
              </material_1.Grid>
            </LocalizationProvider_1.LocalizationProvider>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.TextField
                fullWidth
                type="number"
                label="Min Amount"
                value={amountRange.min}
                onChange={handleMinAmountChange}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">$</material_1.InputAdornment>
                  ),
                }}
              />
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.TextField
                fullWidth
                type="number"
                label="Max Amount"
                value={amountRange.max}
                onChange={handleMaxAmountChange}
                InputProps={{
                  startAdornment: (
                    <material_1.InputAdornment position="start">$</material_1.InputAdornment>
                  ),
                }}
              />
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Paper>
      </material_1.Collapse>

      {/* Expenses Table */}
      <material_1.TableContainer
        component={material_1.Paper}
        sx={{
          overflowX: "auto",
          ".MuiTable-root": {
            minWidth: { xs: "auto", sm: 750 },
          },
        }}
      >
        <material_1.Table>
          <material_1.TableHead>
            <material_1.TableRow>
              <material_1.TableCell padding="checkbox">
                <material_1.Checkbox
                  checked={selectedExpenses.length === filteredExpenses.length}
                  indeterminate={
                    selectedExpenses.length > 0 && selectedExpenses.length < filteredExpenses.length
                  }
                  onChange={handleSelectAll}
                />
              </material_1.TableCell>
              <material_1.TableCell>Date</material_1.TableCell>
              <material_1.TableCell>Merchant</material_1.TableCell>
              {!isMobile && <material_1.TableCell>Description</material_1.TableCell>}
              <material_1.TableCell>Category</material_1.TableCell>
              {!isMobile && <material_1.TableCell>Company</material_1.TableCell>}
              <material_1.TableCell align="right">Amount</material_1.TableCell>
              {!isMobile && <material_1.TableCell>Receipt</material_1.TableCell>}
              <material_1.TableCell align="center">Actions</material_1.TableCell>
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            {filteredExpenses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((expense) => (
                <material_1.TableRow
                  key={expense.id}
                  hover
                  selected={selectedExpenses.some((e) => e.id === expense.id)}
                >
                  <material_1.TableCell padding="checkbox">
                    <material_1.Checkbox
                      checked={selectedExpenses.some((e) => e.id === expense.id)}
                      onChange={() => handleSelectExpense(expense)}
                    />
                  </material_1.TableCell>
                  <material_1.TableCell>
                    <EditableContent expense={expense} field="date" />
                  </material_1.TableCell>
                  <material_1.TableCell>{expense.merchant}</material_1.TableCell>
                  {!isMobile && (
                    <material_1.TableCell>
                      <material_1.Box>
                        <EditableContent expense={expense} field="description" />
                        <material_1.Box sx={{ mt: 0.5 }}>
                          {expense.tags.map((tag) => (
                            <material_1.Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </material_1.Box>
                      </material_1.Box>
                    </material_1.TableCell>
                  )}
                  <material_1.TableCell>
                    <EditableContent expense={expense} field="category" />
                  </material_1.TableCell>
                  {!isMobile && (
                    <material_1.TableCell>
                      <material_1.Chip
                        label={expense.company}
                        size="small"
                        color={
                          expense.company === "Personal"
                            ? "primary"
                            : expense.company === "Down Home"
                              ? "success"
                              : "warning"
                        }
                      />
                    </material_1.TableCell>
                  )}
                  <material_1.TableCell align="right">
                    <EditableContent expense={expense} field="amount" />
                  </material_1.TableCell>
                  {!isMobile && (
                    <material_1.TableCell>
                      {expense.receiptUrl && (
                        <material_1.Tooltip title="View Receipt">
                          <material_1.IconButton
                            size="small"
                            onClick={() => {
                              /* Handle receipt view */
                            }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </material_1.IconButton>
                        </material_1.Tooltip>
                      )}
                    </material_1.TableCell>
                  )}
                  <material_1.TableCell align="center">
                    <material_1.Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      {!isMobile && expense.aiSuggestions && (
                        <material_1.Tooltip title="AI Suggestions Available">
                          <material_1.IconButton size="small" color="secondary">
                            <icons_material_1.AutoFixHigh fontSize="small" />
                          </material_1.IconButton>
                        </material_1.Tooltip>
                      )}
                      <material_1.Tooltip title="Edit">
                        <material_1.IconButton size="small">
                          <icons_material_1.Edit fontSize="small" />
                        </material_1.IconButton>
                      </material_1.Tooltip>
                      <material_1.Tooltip title="Delete">
                        <material_1.IconButton size="small" color="error">
                          <icons_material_1.Delete fontSize="small" />
                        </material_1.IconButton>
                      </material_1.Tooltip>
                    </material_1.Box>
                  </material_1.TableCell>
                </material_1.TableRow>
              ))}
          </material_1.TableBody>
        </material_1.Table>
        <material_1.TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        />
      </material_1.TableContainer>

      <material_1.Box sx={{ mt: 3 }}>
        <material_1.Typography variant="h4" gutterBottom>
          Expenses
        </material_1.Typography>
        <material_1.Grid container spacing={2} alignItems="center">
          <material_1.Grid item xs>
            <CsvUploader_1.CsvUploader type="expenses" onUploadComplete={handleUploadComplete} />
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Box>
    </material_1.Box>
  );
};
exports.Expenses = Expenses;
//# sourceMappingURL=Expenses.js.map
