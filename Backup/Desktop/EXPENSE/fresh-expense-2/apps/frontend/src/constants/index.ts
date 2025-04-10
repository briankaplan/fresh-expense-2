// API Constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Route Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADD_EXPENSE: '/expenses/add',
  EDIT_EXPENSE: '/expenses/edit/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Auth Constants
export const AUTH_TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'food',
  'transportation',
  'housing',
  'utilities',
  'entertainment',
  'healthcare',
  'shopping',
  'other',
] as const;

// UI Constants
export const TOAST_DURATION = 5000;
export const ANIMATION_DURATION = 300;
export const DEBOUNCE_DELAY = 300;
export const MOBILE_BREAKPOINT = 768;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'Please login to continue.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Successfully registered!',
  EXPENSE_ADDED: 'Expense added successfully!',
  EXPENSE_UPDATED: 'Expense updated successfully!',
  EXPENSE_DELETED: 'Expense deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const; 