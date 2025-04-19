var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("@/context/AuthContext");
const material_1 = require("@mui/material");
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = (0, AuthContext_1.useAuth)();
  const location = (0, react_router_dom_1.useLocation)();
  if (loading) {
    return (
      <material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <material_1.CircularProgress />
      </material_1.Box>
    );
  }
  if (!user) {
    return <react_router_dom_1.Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <react_router_dom_1.Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};
exports.ProtectedRoute = ProtectedRoute;
//# sourceMappingURL=ProtectedRoute.js.map
