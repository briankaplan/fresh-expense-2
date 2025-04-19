const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppProviders = AppProviders;
const react_1 = __importDefault(require("react"));
const ThemeContext_1 = require("../context/ThemeContext");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const AuthContext_1 = require("../context/AuthContext");
const CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
const react_router_dom_1 = require("react-router-dom");
function AppProviders() {
  return (
    <ThemeContext_1.ThemeProvider>
      <LocalizationProvider_1.LocalizationProvider dateAdapter={AdapterDateFns_1.AdapterDateFns}>
        <CssBaseline_1.default />
        <AuthContext_1.AuthProvider>
          <react_router_dom_1.Outlet />
        </AuthContext_1.AuthProvider>
      </LocalizationProvider_1.LocalizationProvider>
    </ThemeContext_1.ThemeProvider>
  );
}
exports.default = AppProviders;
//# sourceMappingURL=AppProviders.js.map
