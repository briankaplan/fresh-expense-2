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
exports.ExpensesList = ExpensesList;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const SearchAndFilter_1 = require("./SearchAndFilter");
const ExpenseRow_1 = require("./ExpenseRow");
const LoadingSkeleton_1 = require("./LoadingSkeleton");
const format_1 = require("@/utils/format");
const expense_service_1 = __importDefault(require("@/services/expense.service"));
function ExpensesList({ initialExpenses = [], pageSize = 20 }) {
  const [expenses, setExpenses] = (0, react_1.useState)(initialExpenses);
  const [isLoading, setIsLoading] = (0, react_1.useState)(false);
  const [totalCount, setTotalCount] = (0, react_1.useState)(0);
  const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
  const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
  const [filters, setFilters] = (0, react_1.useState)({});
  const [sortField, setSortField] = (0, react_1.useState)("date");
  const [sortOrder, setSortOrder] = (0, react_1.useState)("desc");
  const [categories, setCategories] = (0, react_1.useState)([]);
  const [merchants, setMerchants] = (0, react_1.useState)([]);
  const [exportMenuAnchor, setExportMenuAnchor] = (0, react_1.useState)(null);
  const expenseService = expense_service_1.default.getInstance();
  const loadData = (0, react_1.useCallback)(async () => {
    setIsLoading(true);
    try {
      const filterParams = {
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
      console.error("Error loading expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, sortField, sortOrder, currentPage, pageSize]);
  (0, react_1.useEffect)(() => {
    loadData();
  }, [loadData]);
  (0, react_1.useEffect)(() => {
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
  const filterOptions = [
    {
      label: "Category",
      value: "category",
      type: "select",
      options: categories.map((cat) => ({ label: cat, value: cat })),
    },
    {
      label: "Status",
      value: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    {
      label: "Merchant",
      value: "merchant",
      type: "select",
      options: merchants.map((merch) => ({ label: merch, value: merch })),
    },
    {
      label: "Min Amount",
      value: "minAmount",
      type: "number",
    },
    {
      label: "Max Amount",
      value: "maxAmount",
      type: "number",
    },
    {
      label: "Start Date",
      value: "startDate",
      type: "date",
    },
    {
      label: "End Date",
      value: "endDate",
      type: "date",
    },
  ];
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const handleExport = async (format) => {
    try {
      const filterParams = {
        search: searchTerm,
        ...filters,
        sortField,
        sortOrder,
      };
      const blob = await expenseService.exportExpenses(filterParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-${(0, format_1.formatDate)(new Date())}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting expenses:", error);
    }
  };
  const handleExportMenuClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };
  if (isLoading && !expenses.length) {
    return <LoadingSkeleton_1.LoadingSkeleton />;
  }
  return (
    <material_1.Box sx={{ width: "100%" }}>
      <material_1.Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <SearchAndFilter_1.SearchAndFilter
          onSearch={setSearchTerm}
          onFilter={setFilters}
          filterOptions={filterOptions}
          placeholder="Search expenses..."
        />
        <material_1.IconButton onClick={handleExportMenuClick}>
          <icons_material_1.Download />
        </material_1.IconButton>
      </material_1.Box>

      <material_1.Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <material_1.MenuItem
          onClick={() => {
            handleExport("csv");
            handleExportMenuClose();
          }}
        >
          Export as CSV
        </material_1.MenuItem>
        <material_1.MenuItem
          onClick={() => {
            handleExport("excel");
            handleExportMenuClose();
          }}
        >
          Export as Excel
        </material_1.MenuItem>
        <material_1.MenuItem
          onClick={() => {
            handleExport("pdf");
            handleExportMenuClose();
          }}
        >
          Export as PDF
        </material_1.MenuItem>
      </material_1.Menu>

      <material_1.TableContainer component={material_1.Paper}>
        <material_1.Table>
          <material_1.TableHead>
            <material_1.TableRow>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "date"}
                  direction={sortField === "date" ? sortOrder : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Date
                </material_1.TableSortLabel>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "description"}
                  direction={sortField === "description" ? sortOrder : "asc"}
                  onClick={() => handleSort("description")}
                >
                  Description
                </material_1.TableSortLabel>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "amount"}
                  direction={sortField === "amount" ? sortOrder : "asc"}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </material_1.TableSortLabel>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "category"}
                  direction={sortField === "category" ? sortOrder : "asc"}
                  onClick={() => handleSort("category")}
                >
                  Category
                </material_1.TableSortLabel>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "merchant"}
                  direction={sortField === "merchant" ? sortOrder : "asc"}
                  onClick={() => handleSort("merchant")}
                >
                  Merchant
                </material_1.TableSortLabel>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.TableSortLabel
                  active={sortField === "status"}
                  direction={sortField === "status" ? sortOrder : "asc"}
                  onClick={() => handleSort("status")}
                >
                  Status
                </material_1.TableSortLabel>
              </material_1.TableCell>
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            {expenses.map((expense) => (
              <ExpenseRow_1.ExpenseRow key={expense.id} expense={expense} />
            ))}
            {expenses.length === 0 && !isLoading && (
              <material_1.TableRow>
                <material_1.TableCell colSpan={6} align="center">
                  <material_1.Typography color="text.secondary">
                    No expenses found
                  </material_1.Typography>
                </material_1.TableCell>
              </material_1.TableRow>
            )}
            {isLoading && expenses.length > 0 && (
              <material_1.TableRow>
                <material_1.TableCell colSpan={6} align="center">
                  <material_1.CircularProgress size={24} />
                </material_1.TableCell>
              </material_1.TableRow>
            )}
          </material_1.TableBody>
        </material_1.Table>
      </material_1.TableContainer>

      {totalCount > pageSize && (
        <material_1.Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <material_1.Pagination
            count={Math.ceil(totalCount / pageSize)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </material_1.Box>
      )}
    </material_1.Box>
  );
}
//# sourceMappingURL=ExpensesList.js.map
