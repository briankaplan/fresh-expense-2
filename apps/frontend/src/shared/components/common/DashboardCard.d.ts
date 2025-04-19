import type { SxProps, Theme } from "@mui/material";
import type React from "react";
import type { Icons } from "../icons";
interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Icons;
  children: React.ReactNode;
  action?: React.ReactNode;
  minHeight?: number | string;
  fullHeight?: boolean;
  elevation?: number;
  variant?: "elevation" | "outlined";
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  onClick?: () => void;
  loading?: boolean;
}
export declare const DashboardCard: React.FC<DashboardCardProps>;
//# sourceMappingURL=DashboardCard.d.ts.map
