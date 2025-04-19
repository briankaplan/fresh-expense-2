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
exports.useAuth = exports.AuthProvider = void 0;
const react_1 = __importStar(require("react"));
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children }) => {
  const [user, setUser] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [error, setError] = (0, react_1.useState)(null);
  (0, react_1.useEffect)(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // TODO: Implement token validation and user fetching
          // For now, we'll just set a mock user
          setUser({
            id: "1",
            email: "user@example.com",
            name: "Test User",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check session");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement actual login logic
      const mockUser = {
        id: "1",
        email,
        name: "Test User",
      };
      setUser(mockUser);
      localStorage.setItem("token", "mock-token");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement actual registration logic
      const mockUser = {
        id: "1",
        email,
        name,
      };
      setUser(mockUser);
      localStorage.setItem("token", "mock-token");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
exports.AuthProvider = AuthProvider;
const useAuth = () => {
  const context = (0, react_1.useContext)(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
exports.useAuth = useAuth;
//# sourceMappingURL=AuthContext.js.map
