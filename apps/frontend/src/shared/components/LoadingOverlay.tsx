import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import type React from "react";
import { useUIStore } from "../store";

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const isLoading = useUIStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
      open={isLoading}
    >
      <CircularProgress color="primary" size={60} />
      {message && (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" component="div">
            {message}
          </Typography>
        </Box>
      )}
    </Backdrop>
  );
};

export default LoadingOverlay;
