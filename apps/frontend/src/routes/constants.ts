export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADD_EXPENSE: '/expenses/add',
  EDIT_EXPENSE: '/expenses/edit/:id',
  EXPENSES: '/expenses',
  ACCOUNTS: '/accounts',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  TRANSACTIONS: '/transactions',
  SUBSCRIPTIONS: '/subscriptions'
} as const; 