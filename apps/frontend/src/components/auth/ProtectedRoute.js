"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = ProtectedRoute;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const store_1 = require("../store");
function ProtectedRoute({ children, requiredRole, redirectTo = '/login', }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { user, isAuthenticated } = (0, store_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        if (!isAuthenticated) {
            navigate(redirectTo);
            return;
        }
        if (requiredRole && user?.role !== requiredRole) {
            navigate('/unauthorized');
        }
    }, [isAuthenticated, user?.role, requiredRole, navigate, redirectTo]);
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }
    return <>{children}</>;
}
//# sourceMappingURL=ProtectedRoute.js.map