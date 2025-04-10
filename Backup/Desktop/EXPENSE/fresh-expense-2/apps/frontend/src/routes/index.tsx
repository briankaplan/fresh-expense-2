import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { ROUTES } from './constants';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ErrorBoundary';
import AppProviders from '../components/AppProviders';

// Lazy load components
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const AddExpense = React.lazy(() => import('../pages/AddExpense'));
const EditExpense = React.lazy(() => import('../pages/EditExpense'));
const ExpensesList = React.lazy(() => import('../pages/ExpensesList'));
const Accounts = React.lazy(() => import('../pages/Accounts'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = React.lazy(() => import('../pages/VerifyEmail'));
const Transactions = React.lazy(() => import('../pages/Transactions'));
const Subscriptions = React.lazy(() => import('../pages/Subscriptions'));

// Layout components
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));
const AuthLayout = React.lazy(() => import('../layouts/AuthLayout'));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Component />
    </ErrorBoundary>
  </Suspense>
);

// Define routes separately to help with HMR
const routes: RouteObject[] = [
  {
    element: <AppProviders />,
    children: [
      {
        path: ROUTES.HOME,
        element: withSuspense(MainLayout),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: withSuspense(Dashboard),
          },
          {
            path: ROUTES.EXPENSES,
            element: withSuspense(ExpensesList),
          },
          {
            path: ROUTES.ADD_EXPENSE,
            element: withSuspense(AddExpense),
          },
          {
            path: ROUTES.EDIT_EXPENSE,
            element: withSuspense(EditExpense),
          },
          {
            path: ROUTES.ACCOUNTS,
            element: withSuspense(Accounts),
          },
          {
            path: ROUTES.PROFILE,
            element: withSuspense(Profile),
          },
          {
            path: ROUTES.SETTINGS,
            element: withSuspense(Settings),
          },
          {
            path: ROUTES.TRANSACTIONS,
            element: withSuspense(Transactions),
          },
          {
            path: ROUTES.SUBSCRIPTIONS,
            element: withSuspense(Subscriptions),
          },
        ],
      },
      {
        element: withSuspense(AuthLayout),
        children: [
          {
            path: ROUTES.LOGIN,
            element: withSuspense(Login),
          },
          {
            path: ROUTES.REGISTER,
            element: withSuspense(Register),
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: withSuspense(ForgotPassword),
          },
          {
            path: ROUTES.RESET_PASSWORD,
            element: withSuspense(ResetPassword),
          },
          {
            path: ROUTES.VERIFY_EMAIL,
            element: withSuspense(VerifyEmail),
          },
        ],
      },
    ],
  },
];

// Create router instance
const router = createBrowserRouter(routes);

// Export both for better HMR support
export { router };
export default router; 