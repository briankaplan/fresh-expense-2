import type React from "react";
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};
export declare const useTheme: () => ThemeContextType;
export declare const ThemeProvider: React.FC<{
  children: React.ReactNode;
}>;
//# sourceMappingURL=ThemeContext.d.ts.map
