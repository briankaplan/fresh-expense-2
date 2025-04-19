import { Box, Button, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetButtonText?: string;
  errorMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {this.props.errorMessage || "Something went wrong"}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {this.state.error?.message}
          </Typography>
          <Button variant="contained" color="primary" onClick={this.handleReset} sx={{ mt: 2 }}>
            {this.props.resetButtonText || "Try again"}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
