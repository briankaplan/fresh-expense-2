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
const react_router_dom_1 = require("react-router-dom");
const useAuth_1 = require("@/shared/hooks/useAuth");
const store_1 = require("../store");
const LoadingOverlay_1 = __importDefault(require("./LoadingOverlay"));
const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = (0, react_1.useState)(true);
  const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
  const { checkAuth } = (0, useAuth_1.useAuth)();
  const location = (0, react_router_dom_1.useLocation)();
  const setIsLoading = (0, store_1.useUIStore)((state) => state.setIsLoading);
  (0, react_1.useEffect)(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const isAuthed = await checkAuth();
        setIsAuthenticated(isAuthed);
      } finally {
        setIsChecking(false);
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, [checkAuth, setIsLoading]);
  if (isChecking) {
    return <LoadingOverlay_1.default message="Verifying authentication..." />;
  }
  if (!isAuthenticated) {
    return <react_router_dom_1.Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
exports.default = ProtectedRoute;
//# sourceMappingURL=ProtectedRoute.js.map
