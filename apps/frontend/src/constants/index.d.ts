import { CATEGORY_METADATA, ExpenseCategoryType } from '@fresh-expense/types';
export declare const API_URL: string;
export declare const ROUTES: {
    readonly HOME: "/";
    readonly LOGIN: "/login";
    readonly REGISTER: "/register";
    readonly DASHBOARD: "/dashboard";
    readonly ADD_EXPENSE: "/expenses/add";
    readonly EDIT_EXPENSE: "/expenses/edit/:id";
    readonly PROFILE: "/profile";
    readonly SETTINGS: "/settings";
};
export declare const AUTH_TOKEN_KEY = "token";
export declare const REFRESH_TOKEN_KEY = "refreshToken";
export declare const USER_KEY = "user";
export declare const EXPENSE_CATEGORIES: ExpenseCategoryType[];
export { CATEGORY_METADATA };
export declare const TOAST_DURATION = 5000;
export declare const ANIMATION_DURATION = 300;
export declare const DEBOUNCE_DELAY = 300;
export declare const MOBILE_BREAKPOINT = 768;
export declare const ERROR_MESSAGES: {
    readonly GENERIC: "Something went wrong. Please try again.";
    readonly UNAUTHORIZED: "Please login to continue.";
    readonly NETWORK: "Network error. Please check your connection.";
    readonly VALIDATION: "Please check your input and try again.";
    readonly NOT_FOUND: "The requested resource was not found.";
};
export declare const SUCCESS_MESSAGES: {
    readonly LOGIN: "Successfully logged in!";
    readonly REGISTER: "Successfully registered!";
    readonly EXPENSE_ADDED: "Expense added successfully!";
    readonly EXPENSE_UPDATED: "Expense updated successfully!";
    readonly EXPENSE_DELETED: "Expense deleted successfully!";
    readonly PROFILE_UPDATED: "Profile updated successfully!";
};
//# sourceMappingURL=index.d.ts.map