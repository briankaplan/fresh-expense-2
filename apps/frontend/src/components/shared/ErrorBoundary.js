"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const react_1 = require("react");
const material_1 = require("@mui/material");
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
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
            return (<material_1.Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    p: 3,
                    textAlign: 'center',
                }}>
          <material_1.Typography variant="h6" color="error" gutterBottom>
            {this.props.errorMessage || 'Something went wrong'}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="text.secondary" paragraph>
            {this.state.error?.message}
          </material_1.Typography>
          <material_1.Button variant="contained" color="primary" onClick={this.handleReset} sx={{ mt: 2 }}>
            {this.props.resetButtonText || 'Try again'}
          </material_1.Button>
        </material_1.Box>);
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map