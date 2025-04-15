import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AddExpense = React.lazy(() => import('./pages/AddExpense'));
const EditExpense = React.lazy(() => import('./pages/EditExpense'));
const ExpensesList = React.lazy(() => import('./pages/ExpensesList'));
const Accounts = React.lazy(() => import('./pages/Accounts'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Layout components
const MainLayout = React.lazy(() => import('./layouts/MainLayout'));
const AuthLayout = React.lazy(() => import('./layouts/AuthLayout'));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Component />
    </ErrorBoundary>
  </Suspense>
);

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
            duration: 5000,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={withSuspense(Login)} />
        <Route path="/register" element={withSuspense(Register)} />
        <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
        <Route path="/" element={withSuspense(MainLayout)}>
          <Route index element={withSuspense(Dashboard)} />
          <Route path="expenses" element={withSuspense(ExpensesList)} />
          <Route path="expenses/add" element={withSuspense(AddExpense)} />
          <Route path="expenses/edit/:id" element={withSuspense(EditExpense)} />
          <Route path="accounts" element={withSuspense(Accounts)} />
          <Route path="profile" element={withSuspense(Profile)} />
          <Route path="settings" element={withSuspense(Settings)} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
