"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
const CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
const styles_1 = require("@mui/material/styles");
const app_1 = __importDefault(require("./app/app"));
const theme_1 = __importDefault(require("./theme/theme"));
require("./styles.css");
const root = client_1.default.createRoot(document.getElementById('root'));
root.render(<react_1.default.StrictMode>
    <styles_1.ThemeProvider theme={theme_1.default}>
      <CssBaseline_1.default />
      <react_router_dom_1.BrowserRouter>
        <app_1.default />
      </react_router_dom_1.BrowserRouter>
    </styles_1.ThemeProvider>
  </react_1.default.StrictMode>);
//# sourceMappingURL=index.js.map