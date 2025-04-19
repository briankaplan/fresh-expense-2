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
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps);
  static getDerivedStateFromError(error: Error): ErrorBoundaryState;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  handleReset: () => void;
  render():
    | string
    | number
    | boolean
    | import("react").JSX.Element
    | Iterable<ReactNode>
    | null
    | undefined;
}
//# sourceMappingURL=ErrorBoundary.d.ts.map
