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
exports.ThemeProvider = exports.useTheme = void 0;
const react_1 = __importStar(require("react"));
const styles_1 = require("@mui/material/styles");
const theme_1 = require("@/core/theme");
const ThemeContext = (0, react_1.createContext)({
  isDarkMode: false,
  toggleTheme: () => {},
});
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = (0, react_1.useState)(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  (0, react_1.useEffect)(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  const currentTheme = {
    ...theme_1.theme,
    palette: {
      ...theme_1.theme.palette,
      mode: isDarkMode ? "dark" : "light",
    },
  };
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <styles_1.ThemeProvider theme={currentTheme}>{children}</styles_1.ThemeProvider>
    </ThemeContext.Provider>
  );
};
exports.ThemeProvider = ThemeProvider;
//# sourceMappingURL=ThemeContext.js.map
