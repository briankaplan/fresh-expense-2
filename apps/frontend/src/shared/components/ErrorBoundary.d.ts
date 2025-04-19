import { Component, ErrorInfo } from 'react';
import { ErrorBoundaryProps } from '@/shared/types';
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