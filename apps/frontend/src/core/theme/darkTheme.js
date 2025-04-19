Object.defineProperty(exports, "__esModule", { value: true });
const styles_1 = require("@mui/material/styles");
const darkTheme = (0, styles_1.createTheme)({
  palette: {
    mode: "dark",
    primary: {
      main: "#7F3DFF", // Purple accent
      light: "#B18AFF",
      dark: "#5B20B6",
    },
    secondary: {
      main: "#FF8700", // Orange accent
      light: "#FFC785",
      dark: "#B85F00",
    },
    background: {
      default: "#1A1A1A", // Main background
      paper: "#252525", // Card background
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
    success: {
      main: "#00A86B",
    },
    error: {
      main: "#FD3C4A",
    },
    warning: {
      main: "#FCAC12",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#303030",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#252525",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#1f1f1f",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
exports.default = darkTheme;
//# sourceMappingURL=darkTheme.js.map
