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
exports.default = Dashboard;
const react_1 = __importStar(require("react"));
const DashboardLayout_1 = require("@/layouts/DashboardLayout");
const DashboardCard_1 = require("@/shared/components/common/DashboardCard");
const material_1 = require("@mui/material");
const AuthContext_1 = require("@/context/AuthContext");
const format_1 = require("@/utils/format");
const react_hot_toast_1 = require("react-hot-toast");
function Dashboard() {
  const { user } = (0, AuthContext_1.useAuth)();
  const [stats, setStats] = (0, react_1.useState)({
    totalExpenses: 0,
    missingReceipts: 0,
    uncategorizedTransactions: 0,
    expensesByCompany: {},
    expensesByCategory: {},
  });
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [transactions, setTransactions] = (0, react_1.useState)([]);
  (0, react_1.useEffect)(() => {
    fetchStats();
  }, [user?.id]);
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses/stats");
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
  if (loading) {
    return (
      <DashboardLayout_1.DashboardLayout>
        <material_1.Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <material_1.CircularProgress />
        </material_1.Box>
      </DashboardLayout_1.DashboardLayout>
    );
  }
  return (
    <DashboardLayout_1.DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.firstName || "User"}`}
    >
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <DashboardCard_1.DashboardCard
            title="Total Expenses"
            subtitle="This month"
            icon="AttachMoney"
          >
            <material_1.Typography variant="h4" color="primary">
              {(0, format_1.formatCurrency)(stats.totalExpenses)}
            </material_1.Typography>
          </DashboardCard_1.DashboardCard>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <DashboardCard_1.DashboardCard
            title="Missing Receipts"
            subtitle="Requires attention"
            icon="Receipt"
          >
            <material_1.Typography variant="h4" color="error">
              {stats.missingReceipts}
            </material_1.Typography>
          </DashboardCard_1.DashboardCard>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <DashboardCard_1.DashboardCard
            title="Uncategorized"
            subtitle="Needs review"
            icon="Category"
          >
            <material_1.Typography variant="h4" color="warning">
              {stats.uncategorizedTransactions}
            </material_1.Typography>
          </DashboardCard_1.DashboardCard>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <DashboardCard_1.DashboardCard
            title="Companies"
            subtitle="Active accounts"
            icon="Business"
          >
            <material_1.Typography variant="h4" color="success">
              {Object.keys(stats.expensesByCompany).length}
            </material_1.Typography>
          </DashboardCard_1.DashboardCard>
        </material_1.Grid>
      </material_1.Grid>
    </DashboardLayout_1.DashboardLayout>
  );
}
//# sourceMappingURL=Dashboard.js.map
