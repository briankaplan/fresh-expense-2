import {
  Box,
  Card,
  CardContent,
  CardHeader,
  type SxProps,
  type Theme,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { Icons } from "../icons";

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

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  action,
  minHeight = "auto",
  fullHeight = false,
  elevation = 1,
  variant = "elevation",
  sx,
  headerSx,
  contentSx,
  onClick,
  loading = false,
}) => {
  const theme = useTheme();
  const Icon = icon ? Icons[icon] : null;

  return (
    <Card
      elevation={elevation}
      variant={variant}
      sx={{
        height: fullHeight ? "100%" : "auto",
        minHeight,
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
        },
        ...sx,
      }}
      onClick={onClick}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {Icon && <Icon sx={{ color: "primary.main" }} />}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
        }
        subheader={subtitle}
        action={action}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          ...headerSx,
        }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ...contentSx,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
