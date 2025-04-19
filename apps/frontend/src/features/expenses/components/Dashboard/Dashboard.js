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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = Dashboard;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const TransactionListContainer_1 = require("../TransactionList/TransactionListContainer");
const ReceiptBank_1 = require("@/features/receipts/components/ReceiptBank/ReceiptBank");
const _utils_1 = require("@utils");
const react_hot_toast_1 = require("react-hot-toast");
function Dashboard() {
  const [selectedCompany, setSelectedCompany] = (0, react_1.useState)("");
  const [stats, setStats] = (0, react_1.useState)({
    totalExpenses: 0,
    missingReceipts: 0,
    uncategorizedTransactions: 0,
    expensesByCompany: {},
    expensesByCategory: {},
  });
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [activeTab, setActiveTab] = (0, react_1.useState)(0);
  const [transactions, setTransactions] = (0, react_1.useState)([]);
  (0, react_1.useEffect)(() => {
    fetchStats();
  }, [selectedCompany]);
  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCompany) queryParams.append("company", selectedCompany);
      const response = await fetch(`/api/expenses/stats?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      react_hot_toast_1.toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };
  const StatCard = ({ title, value, color = "primary" }) => (
    <material_1.Paper sx={{ p: 2, height: "100%" }}>
      <material_1.Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </material_1.Typography>
      <material_1.Typography variant="h4" color={color}>
        {value}
      </material_1.Typography>
    </material_1.Paper>
  );
  return (
    <material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" gutterBottom>
        Expense Dashboard
      </material_1.Typography>

      <material_1.Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <material_1.Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <material_1.Tab label="Overview" />
          <material_1.Tab label="Transactions" />
          <material_1.Tab label="Receipts" />
        </material_1.Tabs>
      </material_1.Box>

      {activeTab === 0 && (
        <>
          <material_1.Grid container spacing={3} sx={{ mb: 3 }}>
            <material_1.Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Expenses"
                value={(0, _utils_1.formatCurrency)(stats.totalExpenses)}
                color="primary"
              />
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={3}>
              <StatCard title="Missing Receipts" value={stats.missingReceipts} color="error" />
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Uncategorized"
                value={stats.uncategorizedTransactions}
                color="secondary"
              />
            </material_1.Grid>
            <material_1.Grid item xs={12} sm={6} md={3}>
              <StatCard title="Selected Company" value={selectedCompany || "All Companies"} />
            </material_1.Grid>
          </material_1.Grid>

          <material_1.Grid container spacing={3}>
            <material_1.Grid item xs={12} md={6}>
              <material_1.Paper sx={{ p: 2, height: "100%" }}>
                <material_1.Typography variant="h6" gutterBottom>
                  Expenses by Company
                </material_1.Typography>
                {Object.entries(stats.expensesByCompany).map(([company, amount]) => (
                  <material_1.Box key={company} sx={{ mb: 1 }}>
                    <material_1.Typography variant="body2" color="text.secondary">
                      {company}
                    </material_1.Typography>
                    <material_1.Typography variant="body1">
                      {(0, _utils_1.formatCurrency)(amount)}
                    </material_1.Typography>
                  </material_1.Box>
                ))}
              </material_1.Paper>
            </material_1.Grid>
            <material_1.Grid item xs={12} md={6}>
              <material_1.Paper sx={{ p: 2, height: "100%" }}>
                <material_1.Typography variant="h6" gutterBottom>
                  Expenses by Category
                </material_1.Typography>
                {Object.entries(stats.expensesByCategory).map(([category, amount]) => (
                  <material_1.Box key={category} sx={{ mb: 1 }}>
                    <material_1.Typography variant="body2" color="text.secondary">
                      {category}
                    </material_1.Typography>
                    <material_1.Typography variant="body1">
                      {(0, _utils_1.formatCurrency)(amount)}
                    </material_1.Typography>
                  </material_1.Box>
                ))}
              </material_1.Paper>
            </material_1.Grid>
          </material_1.Grid>
        </>
      )}

      {activeTab === 1 && (
        <TransactionListContainer_1.TransactionListContainer
          company={selectedCompany}
          onCompanyChange={setSelectedCompany}
        />
      )}

      {activeTab === 2 && (
        <ReceiptBank_1.ReceiptBank
          company={selectedCompany}
          transactions={transactions}
          onReceiptsChange={(receipts) => {
            // Update stats when receipts change
            setStats((prev) => ({
              ...prev,
              missingReceipts: receipts.filter((r) => !r.transactionId).length,
            }));
          }}
        />
      )}
    </material_1.Box>
  );
}
//# sourceMappingURL=Dashboard.js.map
