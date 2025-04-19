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
var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_hot_toast_1 = require("react-hot-toast");
const AuthContext_1 = require("@/context/AuthContext");
const ProtectedRoute_1 = require("@/components/ProtectedRoute");
const Loading_1 = __importDefault(require("@/components/Loading"));
const ErrorBoundary_1 = __importDefault(require("@/components/ErrorBoundary"));
// Lazy load components
const Login = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Login"))),
);
const Register = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Register"))),
);
const ForgotPassword = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/ForgotPassword"))),
);
const Dashboard = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Dashboard"))),
);
const ExpensesList = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/ExpensesList"))),
);
const AddExpense = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/AddExpense"))),
);
const EditExpense = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/EditExpense"))),
);
const Accounts = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Accounts"))),
);
const Profile = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Profile"))),
);
const Settings = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Settings"))),
);
const Unauthorized = react_1.default.lazy(() =>
  Promise.resolve().then(() => __importStar(require("@/pages/Unauthorized"))),
);
const withSuspense = (Component) => (
  <react_1.Suspense fallback={<Loading_1.default />}>
    <ErrorBoundary_1.default fallback={<div>Something went wrong</div>}>
      <Component />
    </ErrorBoundary_1.default>
  </react_1.Suspense>
);
const App = () => {
  return (
    <react_router_dom_1.BrowserRouter>
      <AuthContext_1.AuthProvider>
        <react_hot_toast_1.Toaster position="top-right" />
        <react_router_dom_1.Routes>
          {/* Public routes */}
          <react_router_dom_1.Route path="/login" element={withSuspense(Login)} />
          <react_router_dom_1.Route path="/register" element={withSuspense(Register)} />
          <react_router_dom_1.Route
            path="/forgot-password"
            element={withSuspense(ForgotPassword)}
          />
          <react_router_dom_1.Route path="/unauthorized" element={withSuspense(Unauthorized)} />

          {/* Protected routes */}
          <react_router_dom_1.Route
            path="/dashboard"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(Dashboard)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/expenses"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(ExpensesList)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/expenses/add"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(AddExpense)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/expenses/:id/edit"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(EditExpense)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/accounts"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(Accounts)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/profile"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(Profile)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />
          <react_router_dom_1.Route
            path="/settings"
            element={
              <ProtectedRoute_1.ProtectedRoute>
                {withSuspense(Settings)}
              </ProtectedRoute_1.ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <react_router_dom_1.Route
            path="/"
            element={<react_router_dom_1.Navigate to="/dashboard" replace />}
          />

          {/* Catch all route */}
          <react_router_dom_1.Route
            path="*"
            element={<react_router_dom_1.Navigate to="/dashboard" replace />}
          />
        </react_router_dom_1.Routes>
      </AuthContext_1.AuthProvider>
    </react_router_dom_1.BrowserRouter>
  );
};
exports.default = App;
//# sourceMappingURL=App.js.map
