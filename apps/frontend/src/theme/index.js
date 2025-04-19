Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const styles_1 = require("@mui/material/styles");
exports.theme = (0, styles_1.createTheme)({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});
//# sourceMappingURL=index.js.map
