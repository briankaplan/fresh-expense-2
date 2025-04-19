Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionListContainer = TransactionListContainer;
const react_1 = require("react");
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const TransactionList_1 = require("./TransactionList");
const react_hot_toast_1 = require("react-hot-toast");
const ui_1 = require("@fresh-expense/ui");
const react_query_1 = require("@tanstack/react-query");
function TransactionListContainer({ company, onCompanyChange }) {
  const queryClient = (0, react_query_1.useQueryClient)();
  const [selectedCategory, setSelectedCategory] = (0, react_1.useState)("");
  const [dateRange, setDateRange] = (0, react_1.useState)({
    start: null,
    end: null,
  });
  const [amountRange, setAmountRange] = (0, react_1.useState)({
    min: "",
    max: "",
  });
  // Fetch transactions with React Query
  const { data: transactions = [], isLoading } = (0, react_query_1.useQuery)({
    queryKey: ["transactions", company, selectedCategory, dateRange, amountRange],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (company) queryParams.append("company", company);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (dateRange.start) queryParams.append("startDate", dateRange.start.toISOString());
      if (dateRange.end) queryParams.append("endDate", dateRange.end.toISOString());
      if (amountRange.min) queryParams.append("minAmount", amountRange.min);
      if (amountRange.max) queryParams.append("maxAmount", amountRange.max);
      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });
  // Update transaction mutation with optimistic updates
  const updateTransactionMutation = (0, react_query_1.useMutation)({
    mutationFn: async ({ id, field, value }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      return response.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions"]);
      // Optimistically update to the new value
      queryClient.setQueryData(["transactions"], (old) =>
        old?.map((t) => (t.id != null ? { ...t, [variables.field]: variables.value } : t)),
      );
      return { previousTransactions };
    },
    onError: (_err, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(["transactions"], context.previousTransactions);
      }
      react_hot_toast_1.toast.error("Failed to update transaction");
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
  // AI Categorize mutation
  const categorizeMutation = (0, react_query_1.useMutation)({
    mutationFn: async (id) => {
      const response = await fetch(`/api/transactions/${id}/categorize`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to categorize transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      react_hot_toast_1.toast.success("Transaction categorized successfully");
    },
    onError: () => {
      react_hot_toast_1.toast.error("Failed to categorize transaction");
    },
  });
  const handleEdit = async (transaction, field, value) => {
    try {
      // Validate the value based on the field type
      if (field === "amount" && Number.isNaN(Number(value))) {
        throw new Error("Invalid amount");
      }
      if (field === "date" && !isValidDate(value)) {
        throw new Error("Invalid date");
      }
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        field,
        value: field === "amount" ? Number(value) : value,
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };
  const handleReceiptClick = async (transaction) => {
    // Implement receipt viewer logic
    console.log("View receipt for transaction:", transaction.id);
  };
  const handleAICategorize = async (transaction) => {
    try {
      await categorizeMutation.mutateAsync(transaction.id);
    } catch (error) {
      console.error("Error categorizing transaction:", error);
    }
  };
  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    react_hot_toast_1.toast.success("Transactions uploaded successfully");
  };
  return (
    <material_1.Box>
      <material_1.Paper sx={{ p: 2, mb: 2 }}>
        <material_1.Grid container spacing={2} alignItems="center">
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.TextField
              select
              fullWidth
              label="Company"
              value={company}
              onChange={(e) => onCompanyChange?.(e.target.value)}
            >
              <material_1.MenuItem value="Down Home">Down Home</material_1.MenuItem>
              <material_1.MenuItem value="Music City Rodeo">Music City Rodeo</material_1.MenuItem>
              <material_1.MenuItem value="Personal">Personal</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.TextField
              select
              fullWidth
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <material_1.MenuItem value="">All Categories</material_1.MenuItem>
              <material_1.MenuItem value="Food & Dining">Food & Dining</material_1.MenuItem>
              <material_1.MenuItem value="Transportation">Transportation</material_1.MenuItem>
              <material_1.MenuItem value="Entertainment">Entertainment</material_1.MenuItem>
              <material_1.MenuItem value="Utilities">Utilities</material_1.MenuItem>
              <material_1.MenuItem value="Office Supplies">Office Supplies</material_1.MenuItem>
              <material_1.MenuItem value="Marketing">Marketing</material_1.MenuItem>
              <material_1.MenuItem value="Software">Software</material_1.MenuItem>
              <material_1.MenuItem value="Travel">Travel</material_1.MenuItem>
              <material_1.MenuItem value="Other">Other</material_1.MenuItem>
            </material_1.TextField>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider_1.LocalizationProvider
              dateAdapter={AdapterDateFns_1.AdapterDateFns}
            >
              <DatePicker_1.DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider_1.LocalizationProvider>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider_1.LocalizationProvider
              dateAdapter={AdapterDateFns_1.AdapterDateFns}
            >
              <DatePicker_1.DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider_1.LocalizationProvider>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.TextField
              fullWidth
              label="Min Amount"
              value={amountRange.min}
              onChange={(e) => setAmountRange((prev) => ({ ...prev, min: e.target.value }))}
              type="number"
            />
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.TextField
              fullWidth
              label="Max Amount"
              value={amountRange.max}
              onChange={(e) => setAmountRange((prev) => ({ ...prev, max: e.target.value }))}
              type="number"
            />
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <ui_1.CsvUploader
              onUploadComplete={handleUploadComplete}
              uploadUrl="/api/transactions/upload"
            />
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Paper>

      <TransactionList_1.TransactionList
        transactions={transactions}
        loading={isLoading}
        onEdit={handleEdit}
        onReceiptClick={handleReceiptClick}
        onAICategorize={handleAICategorize}
      />
    </material_1.Box>
  );
}
function isValidDate(date) {
  return !Number.isNaN(Date.parse(date));
}
//# sourceMappingURL=TransactionListContainer.js.map
