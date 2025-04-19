import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load components
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const ExpensesList = React.lazy(() => import('@/pages/ExpensesList'));
const AddExpense = React.lazy(() => import('@/pages/AddExpense'));
const EditExpense = React.lazy(() => import('@/pages/EditExpense'));
const Accounts = React.lazy(() => import('@/pages/Accounts'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Component />
    </ErrorBoundary>
  </Suspense>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={withSuspense(Login)} />
          <Route path="/register" element={withSuspense(Register)} />
          <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
          <Route path="/unauthorized" element={withSuspense(Unauthorized)} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute>{withSuspense(Dashboard)}</ProtectedRoute>}
          />
          <Route
            path="/expenses"
            element={<ProtectedRoute>{withSuspense(ExpensesList)}</ProtectedRoute>}
          />
          <Route
            path="/expenses/add"
            element={<ProtectedRoute>{withSuspense(AddExpense)}</ProtectedRoute>}
          />
          <Route
            path="/expenses/:id/edit"
            element={<ProtectedRoute>{withSuspense(EditExpense)}</ProtectedRoute>}
          />
          <Route
            path="/accounts"
            element={<ProtectedRoute>{withSuspense(Accounts)}</ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute>{withSuspense(Profile)}</ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute>{withSuspense(Settings)}</ProtectedRoute>}
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
