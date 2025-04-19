Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_MESSAGES =
  exports.ERROR_MESSAGES =
  exports.MOBILE_BREAKPOINT =
  exports.DEBOUNCE_DELAY =
  exports.ANIMATION_DURATION =
  exports.TOAST_DURATION =
  exports.CATEGORY_METADATA =
  exports.EXPENSE_CATEGORIES =
  exports.USER_KEY =
  exports.REFRESH_TOKEN_KEY =
  exports.AUTH_TOKEN_KEY =
  exports.ROUTES =
  exports.API_URL =
    void 0;
const types_1 = require("@fresh-expense/types");
Object.defineProperty(exports, "CATEGORY_METADATA", {
  enumerable: true,
  get: () => types_1.CATEGORY_METADATA,
});
// API Constants
exports.API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// Route Constants
exports.ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ADD_EXPENSE: "/expenses/add",
  EDIT_EXPENSE: "/expenses/edit/:id",
  PROFILE: "/profile",
  SETTINGS: "/settings",
};
// Auth Constants
exports.AUTH_TOKEN_KEY = "token";
exports.REFRESH_TOKEN_KEY = "refreshToken";
exports.USER_KEY = "user";
// Expense Categories
exports.EXPENSE_CATEGORIES = Object.keys(types_1.CATEGORY_METADATA);
// UI Constants
exports.TOAST_DURATION = 5000;
exports.ANIMATION_DURATION = 300;
exports.DEBOUNCE_DELAY = 300;
exports.MOBILE_BREAKPOINT = 768;
// Error Messages
exports.ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  UNAUTHORIZED: "Please login to continue.",
  NETWORK: "Network error. Please check your connection.",
  VALIDATION: "Please check your input and try again.",
  NOT_FOUND: "The requested resource was not found.",
};
// Success Messages
exports.SUCCESS_MESSAGES = {
  LOGIN: "Successfully logged in!",
  REGISTER: "Successfully registered!",
  EXPENSE_ADDED: "Expense added successfully!",
  EXPENSE_UPDATED: "Expense updated successfully!",
  EXPENSE_DELETED: "Expense deleted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
};
//# sourceMappingURL=index.js.map
