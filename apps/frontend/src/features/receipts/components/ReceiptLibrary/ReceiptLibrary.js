var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
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
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptLibrary = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const x_date_pickers_1 = require("@mui/x-date-pickers");
const date_fns_1 = require("date-fns");
const ui_1 = require("@fresh-expense/ui");
const receipt_service_1 = require("../../../../services/receipt.service");
const react_toastify_1 = require("react-toastify");
const ReceiptLibrary = ({ company }) => {
  const [receipts, setReceipts] = (0, react_1.useState)([]);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
  const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
  const [dateRange, setDateRange] = (0, react_1.useState)({
    start: null,
    end: null,
  });
  const [selectedReceipts, setSelectedReceipts] = (0, react_1.useState)([]);
  const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
  (0, react_1.useEffect)(() => {
    fetchReceipts();
  }, [company, statusFilter, dateRange]);
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (company) queryParams.append("company", company);
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (dateRange.start) queryParams.append("startDate", dateRange.start.toISOString());
      if (dateRange.end) queryParams.append("endDate", dateRange.end.toISOString());
      const response = await receipt_service_1.ReceiptService.getReceipts(queryParams.toString());
      setReceipts(response);
    } catch (error) {
      react_toastify_1.toast.error("Failed to fetch receipts");
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
  };
  const handleDateRangeChange = (field, date) => {
    setDateRange((prev) => ({ ...prev, [field]: date }));
  };
  const handleBulkDownload = async () => {
    try {
      setLoading(true);
      const selectedReceiptsData = receipts.filter((r) => selectedReceipts.includes(r.id));
      await receipt_service_1.ReceiptService.downloadReceipts(selectedReceiptsData);
      react_toastify_1.toast.success("Receipts downloaded successfully");
    } catch (error) {
      react_toastify_1.toast.error("Failed to download receipts");
      console.error("Error downloading receipts:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(
        selectedReceipts.map((id) => receipt_service_1.ReceiptService.deleteReceipt(id)),
      );
      await fetchReceipts();
      react_toastify_1.toast.success("Receipts deleted successfully");
    } catch (error) {
      react_toastify_1.toast.error("Failed to delete receipts");
      console.error("Error deleting receipts:", error);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      field: "filename",
      headerName: "Filename",
      flex: 1,
      renderCell: (params) => (
        <material_1.Box display="flex" alignItems="center" gap={1}>
          <material_1.Typography>{params.value}</material_1.Typography>
          {params.row.status != null && (
            <material_1.Chip label="Unmatched" color="warning" size="small" />
          )}
        </material_1.Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <material_1.Chip
          label={params.value}
          color={
            params.value != null
              ? "success"
              : params.value != null
                ? "warning"
                : params.value != null
                  ? "info"
                  : "error"
          }
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Upload Date",
      width: 150,
      renderCell: (params) => (0, date_fns_1.format)(new Date(params.value), "MMM d, yyyy"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <material_1.Box>
          <material_1.Tooltip title="Download">
            <material_1.IconButton
              onClick={() => receipt_service_1.ReceiptService.downloadReceipt(params.row.id)}
              size="small"
            >
              <icons_material_1.CloudDownload />
            </material_1.IconButton>
          </material_1.Tooltip>
          <material_1.Tooltip title="View Details">
            <material_1.IconButton onClick={() => handleViewDetails(params.row)} size="small">
              <icons_material_1.Visibility />
            </material_1.IconButton>
          </material_1.Tooltip>
          <material_1.Tooltip title="More Actions">
            <material_1.IconButton onClick={(e) => handleMenuOpen(e, params.row)} size="small">
              <icons_material_1.MoreVert />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      ),
    },
  ];
  return (
    <material_1.Box sx={{ p: 3 }}>
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Box display="flex" alignItems="center" gap={2} mb={2}>
              <material_1.TextField
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <icons_material_1.Search />,
                }}
                sx={{ flex: 1 }}
              />
              <material_1.FormControl sx={{ minWidth: 150 }}>
                <material_1.InputLabel>Status</material_1.InputLabel>
                <material_1.Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  label="Status"
                >
                  <material_1.MenuItem value="all">All</material_1.MenuItem>
                  <material_1.MenuItem value="matched">Matched</material_1.MenuItem>
                  <material_1.MenuItem value="unmatched">Unmatched</material_1.MenuItem>
                  <material_1.MenuItem value="processing">Processing</material_1.MenuItem>
                  <material_1.MenuItem value="error">Error</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
              <x_date_pickers_1.DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(date) => handleDateRangeChange("start", date)}
                slotProps={{ textField: { size: "small" } }}
              />
              <x_date_pickers_1.DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(date) => handleDateRangeChange("end", date)}
                slotProps={{ textField: { size: "small" } }}
              />
            </material_1.Box>
            <material_1.Box display="flex" justifyContent="space-between" mb={2}>
              <material_1.Typography variant="h6">
                {selectedReceipts.length > 0
                  ? `${selectedReceipts.length} selected`
                  : `${receipts.length} receipts`}
              </material_1.Typography>
              <material_1.Box>
                {selectedReceipts.length > 0 && (
                  <>
                    <material_1.Button
                      startIcon={<icons_material_1.Download />}
                      onClick={handleBulkDownload}
                      disabled={loading}
                    >
                      Download Selected
                    </material_1.Button>
                    <material_1.Button
                      startIcon={<icons_material_1.Delete />}
                      onClick={handleBulkDelete}
                      disabled={loading}
                      color="error"
                    >
                      Delete Selected
                    </material_1.Button>
                  </>
                )}
              </material_1.Box>
            </material_1.Box>
            <ui_1.DataTable
              rows={receipts}
              columns={columns}
              loading={loading}
              checkboxSelection
              onSelectionModelChange={(newSelection) => {
                setSelectedReceipts(newSelection);
              }}
              selectionModel={selectedReceipts}
            />
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>
  );
};
exports.ReceiptLibrary = ReceiptLibrary;
//# sourceMappingURL=ReceiptLibrary.js.map
