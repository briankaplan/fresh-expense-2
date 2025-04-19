import type { ErrorBoundaryProps } from "@/shared/types";
import { Component, type ErrorInfo } from "react";
interface State {
  hasError: boolean;
  error: Error | null;
}
declare class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps);
  static getDerivedStateFromError(error: Error): State;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  render(): any;
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.d.ts.map
