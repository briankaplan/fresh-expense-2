"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map