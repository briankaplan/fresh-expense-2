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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const FilterList_1 = __importDefault(require("@mui/icons-material/FilterList"));
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const Save_1 = __importDefault(require("@mui/icons-material/Save"));
const Close_1 = __importDefault(require("@mui/icons-material/Close"));
const AnimatedWrapper_1 = __importDefault(require("@/shared/components/AnimatedWrapper"));
const react_hot_toast_1 = require("react-hot-toast");
const Transactions = () => {
  // State for filters
  const [startDate, setStartDate] = (0, react_1.useState)(null);
  const [endDate, setEndDate] = (0, react_1.useState)(null);
  const [category, setCategory] = (0, react_1.useState)("");
  const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
  const [page, setPage] = (0, react_1.useState)(0);
  const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
  const [filterOpen, setFilterOpen] = (0, react_1.useState)(false);
  const [expandedRow, setExpandedRow] = (0, react_1.useState)(null);
  const [editingCell, setEditingCell] = (0, react_1.useState)(null);
  const [editValue, setEditValue] = (0, react_1.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
  const theme = (0, material_1.useTheme)();
  const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down("sm"));
  // Mock data - replace with actual API call
  const mockTransactions = [
    {
      id: "1",
      description: "Grocery shopping",
      amount: 85.5,
      date: new Date("2024-04-08"),
      category: "Groceries",
      merchant: "Whole Foods",
      status: "completed",
    },
    {
      id: "2",
      description: "Monthly rent",
      amount: 1200.0,
      date: new Date("2024-04-01"),
      category: "Housing",
      merchant: "Apartment Complex",
      status: "completed",
    },
  ];
  const categories = ["Food", "Income", "Transportation", "Entertainment", "Bills"];
  const handleChangePage = (event, newPage) => {
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
  const handleDateChange = (date, setter) => {
    setter(date);
  };
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || transaction.category === category;
    const matchesDateRange =
      (!startDate || new Date(transaction.date) >= startDate) &&
      (!endDate || new Date(transaction.date) <= endDate);
    return matchesSearch && matchesCategory && matchesDateRange;
  });
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  const handleStartEdit = (transaction, field) => {
    setEditingCell({ rowId: transaction.id, field });
    setEditValue(String(transaction[field]));
  };
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };
  const handleSaveEdit = async (transaction) => {
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
      // API call to update the transaction
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [editingCell.field]: value,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }
      // Update local state
      const updatedTransactions = mockTransactions.map((t) => {
        if (t.id === transaction.id) {
          return { ...t, [editingCell.field]: value };
        }
        return t;
      });
      // Update your transactions state here
      // setTransactions(updatedTransactions);
      react_hot_toast_1.toast.success("Transaction updated successfully");
      handleCancelEdit();
    } catch (error) {
      react_hot_toast_1.toast.error("Failed to update transaction");
      console.error("Error updating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const EditableContent = ({ transaction, field }) => {
    const isEditing = editingCell?.rowId === transaction.id && editingCell?.field === field;
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
          onClick={() => handleStartEdit(transaction, field)}
        >
          {field === "amount" ? (
            formatCurrency(transaction[field])
          ) : field === "category" ? (
            <material_1.Chip label={transaction[field]} size="small" />
          ) : (
            transaction[field]
          )}
          <Edit_1.default
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
                handleSaveEdit(transaction);
              }
            }}
          />
          <material_1.IconButton
            size="small"
            onClick={() => handleSaveEdit(transaction)}
            disabled={isSubmitting}
            color="primary"
          >
            <Save_1.default fontSize="small" />
          </material_1.IconButton>
          <material_1.IconButton size="small" onClick={handleCancelEdit} disabled={isSubmitting}>
            <Close_1.default fontSize="small" />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.ClickAwayListener>
    );
  };
  const MobileTransactionCard = ({ transaction, index }) => (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <material_1.Card
        sx={{
          mb: 2,
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        <material_1.CardContent>
          <material_1.Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <EditableContent transaction={transaction} field="description" />
            <EditableContent transaction={transaction} field="amount" />
          </material_1.Box>

          <material_1.Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <material_1.Typography variant="body2" color="text.secondary">
              {new Date(transaction.date).toLocaleDateString()}
            </material_1.Typography>
            <EditableContent transaction={transaction} field="category" />
            <material_1.Chip
              label={transaction.status}
              size="small"
              color={transaction.status === "completed" ? "success" : "warning"}
            />
          </material_1.Box>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>
  );
  return (
    <AnimatedWrapper_1.default>
      <material_1.Box sx={{ p: 2 }}>
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
            <material_1.Typography variant="h4" gutterBottom={isMobile}>
              Transactions
            </material_1.Typography>
            <material_1.Button
              fullWidth={isMobile}
              variant="outlined"
              startIcon={<FilterList_1.default />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters {filterOpen ? "▼" : "▲"}
            </material_1.Button>
          </material_1.Box>
        </framer_motion_1.motion.div>

        <framer_motion_1.AnimatePresence>
          {filterOpen && (
            <framer_motion_1.motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <material_1.Paper sx={{ p: 2, mb: 3, overflow: "hidden" }}>
                <material_1.Grid container spacing={2} alignItems="center">
                  <material_1.Grid item xs={12} md={4}>
                    <material_1.TextField
                      fullWidth
                      label="Search transactions"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </material_1.Grid>
                  <material_1.Grid item xs={12} sm={6} md={2}>
                    <material_1.TextField
                      fullWidth
                      select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <material_1.MenuItem value="">All</material_1.MenuItem>
                      {categories.map((cat) => (
                        <material_1.MenuItem key={cat} value={cat}>
                          {cat}
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
                        value={startDate}
                        onChange={(date) => handleDateChange(date, setStartDate)}
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
                        value={endDate}
                        onChange={(date) => handleDateChange(date, setEndDate)}
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
                    <material_1.Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm("");
                        setCategory("");
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      Clear Filters
                    </material_1.Button>
                  </material_1.Grid>
                </material_1.Grid>
              </material_1.Paper>
            </framer_motion_1.motion.div>
          )}
        </framer_motion_1.AnimatePresence>

        {/* Mobile View */}
        {isMobile ? (
          <framer_motion_1.motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <material_1.Box>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction, index) => (
                  <MobileTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                ))}
            </material_1.Box>
          </framer_motion_1.motion.div>
        ) : (
          /* Desktop Table View */
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <material_1.TableContainer
              component={material_1.Paper}
              sx={{
                overflowX: "auto",
                ".MuiTable-root": {
                  minWidth: 750,
                },
              }}
            >
              <material_1.Table>
                <material_1.TableHead>
                  <material_1.TableRow>
                    <material_1.TableCell>Date</material_1.TableCell>
                    <material_1.TableCell>Description</material_1.TableCell>
                    <material_1.TableCell>Category</material_1.TableCell>
                    <material_1.TableCell align="right">Amount</material_1.TableCell>
                    <material_1.TableCell>Status</material_1.TableCell>
                  </material_1.TableRow>
                </material_1.TableHead>
                <material_1.TableBody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction, index) => (
                      <framer_motion_1.motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          display: "table-row",
                        }}
                      >
                        <material_1.TableCell>
                          <EditableContent transaction={transaction} field="date" />
                        </material_1.TableCell>
                        <material_1.TableCell>
                          <EditableContent transaction={transaction} field="description" />
                        </material_1.TableCell>
                        <material_1.TableCell>
                          <EditableContent transaction={transaction} field="category" />
                        </material_1.TableCell>
                        <material_1.TableCell align="right">
                          <EditableContent transaction={transaction} field="amount" />
                        </material_1.TableCell>
                        <material_1.TableCell>
                          <EditableContent transaction={transaction} field="status" />
                        </material_1.TableCell>
                      </framer_motion_1.motion.tr>
                    ))}
                </material_1.TableBody>
              </material_1.Table>
            </material_1.TableContainer>
          </framer_motion_1.motion.div>
        )}

        <framer_motion_1.motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <material_1.TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
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
        </framer_motion_1.motion.div>
      </material_1.Box>
    </AnimatedWrapper_1.default>
  );
};
exports.default = Transactions;
//# sourceMappingURL=Transactions.js.map
