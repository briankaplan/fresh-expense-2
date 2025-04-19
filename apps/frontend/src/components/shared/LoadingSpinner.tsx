import { Box, CircularProgress, type SxProps, type Theme, Typography } from "@mui/material";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
  color?: "primary" | "secondary" | "inherit";
  thickness?: number;
  sx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = false,
  size = 40,
  color = "primary",
  thickness = 4,
  sx,
  containerSx,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : "auto",
        p: 3,
        ...containerSx,
      }}
    >
      <CircularProgress size={size} color={color} thickness={thickness} sx={sx} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
