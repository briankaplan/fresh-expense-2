import { type ThemeOptions, createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {}

const getDesignTokens = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#7F3DFF" : "#E4CCFF",
      light: mode === "light" ? "#EEE5FF" : "#B18AFF",
      dark: mode === "light" ? "#5B20B6" : "#7F3DFF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: mode === "light" ? "#FF8700" : "#FFB660",
      light: mode === "light" ? "#FFF6ED" : "#FFC785",
      dark: mode === "light" ? "#B85F00" : "#FF8700",
      contrastText: "#FFFFFF",
    },
    error: {
      main: mode === "light" ? "#FD3C4A" : "#FF6B76",
      light: mode === "light" ? "#FDD5D7" : "#FF8F97",
      dark: mode === "light" ? "#B41E29" : "#FD3C4A",
    },
    success: {
      main: mode === "light" ? "#00A86B" : "#2DC89B",
      light: mode === "light" ? "#CFFAEA" : "#65E1B9",
      dark: mode === "light" ? "#006B44" : "#00A86B",
    },
    warning: {
      main: mode === "light" ? "#FCAC12" : "#FFB946",
      light: mode === "light" ? "#FCE4C0" : "#FFCF7E",
      dark: mode === "light" ? "#B37A0A" : "#FCAC12",
    },
    background: {
      default: mode === "light" ? "#F6F6F6" : "#0D0D0D",
      paper: mode === "light" ? "#FFFFFF" : "#1F1F1F",
      card: mode === "light" ? "#FFFFFF" : "#2D2D2D",
      tooltip: mode === "light" ? "#1F1F1F" : "#F6F6F6",
    },
    text: {
      primary: mode === "light" ? "#1F1F1F" : "#FFFFFF",
      secondary: mode === "light" ? "#91919F" : "#D3D3D3",
      disabled: mode === "light" ? "#C8C8C8" : "#6B6B6B",
    },
    divider: mode === "light" ? "#E3E3E3" : "#404040",
    action: {
      active: mode === "light" ? "#91919F" : "#D3D3D3",
      hover: mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
      selected: mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
      disabled: mode === "light" ? "rgba(0, 0, 0, 0.26)" : "rgba(255, 255, 255, 0.26)",
      disabledBackground: mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.card,
          borderRadius: theme.shape.borderRadius,
          boxShadow:
            mode === "light" ? "0px 2px 4px rgba(0, 0, 0, 0.05)" : "0px 2px 4px rgba(0, 0, 0, 0.2)",
          transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
          "&:hover": {
            boxShadow:
              mode === "light"
                ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
                : "0px 4px 8px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-2px)",
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 16px",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          strokeLinecap: "round",
        },
      },
    },
  },
});

export const getTheme = (mode: "light" | "dark") => {
  const themeOptions = getDesignTokens(mode);
  return createTheme(themeOptions);
};

export const lightTheme = getTheme("light");
export const darkTheme = getTheme("dark");

export default lightTheme;
