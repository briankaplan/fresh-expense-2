"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_hot_toast_1 = require("react-hot-toast");
const api_1 = require("../services/api");
const store_1 = require("../store");
const useAuth = () => {
    const [user, setUser] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const setIsLoading = (0, store_1.useUIStore)(state => state.setIsLoading);
    const login = (0, react_1.useCallback)(async (credentials) => {
        setIsLoading(true);
        try {
            const response = await api_1.apiClient.post('/auth/login', credentials);
            localStorage.setItem(import.meta.env.VITE_JWT_STORAGE_KEY, response.data.token);
            localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, response.data.refreshToken);
            setUser(response.data.user);
            react_hot_toast_1.toast.success('Welcome back!');
            navigate('/dashboard');
        }
        finally {
            setIsLoading(false);
        }
    }, [navigate, setIsLoading]);
    const register = (0, react_1.useCallback)(async (data) => {
        setIsLoading(true);
        try {
            const response = await api_1.apiClient.post('/auth/register', data);
            localStorage.setItem(import.meta.env.VITE_JWT_STORAGE_KEY, response.data.token);
            localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, response.data.refreshToken);
            setUser(response.data.user);
            react_hot_toast_1.toast.success('Registration successful!');
            navigate('/dashboard');
        }
        finally {
            setIsLoading(false);
        }
    }, [navigate, setIsLoading]);
    const logout = (0, react_1.useCallback)(() => {
        localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
        localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
        setUser(null);
        navigate('/login');
        react_hot_toast_1.toast.success('You have been logged out');
    }, [navigate]);
    const forgotPassword = (0, react_1.useCallback)(async (email) => {
        setIsLoading(true);
        try {
            await api_1.apiClient.post('/auth/forgot-password', { email });
            react_hot_toast_1.toast.success('Password reset instructions have been sent to your email');
            navigate('/login');
        }
        finally {
            setIsLoading(false);
        }
    }, [navigate, setIsLoading]);
    const resetPassword = (0, react_1.useCallback)(async (token, newPassword) => {
        setIsLoading(true);
        try {
            await api_1.apiClient.post('/auth/reset-password', { token, newPassword });
            react_hot_toast_1.toast.success('Password has been reset successfully');
            navigate('/login');
        }
        finally {
            setIsLoading(false);
        }
    }, [navigate, setIsLoading]);
    const checkAuth = (0, react_1.useCallback)(async () => {
        const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
        if (!token) {
            return false;
        }
        try {
            const response = await api_1.apiClient.get('/auth/me');
            setUser(response.data.user);
            return true;
        }
        catch {
            logout();
            return false;
        }
    }, [logout]);
    return {
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
        isAuthenticated: !!user,
    };
};
exports.useAuth = useAuth;
exports.default = exports.useAuth;
//# sourceMappingURL=useAuth.js.map