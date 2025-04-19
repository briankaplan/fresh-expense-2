import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { UserRole } from '@fresh-expense/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
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
