import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useUIStore } from '../store';
import LoadingOverlay from './LoadingOverlay';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { checkAuth } = useAuth();
  const location = useLocation();
  const setIsLoading = useUIStore(state => state.setIsLoading);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const isAuthed = await checkAuth();
        setIsAuthenticated(isAuthed);
      } finally {
        setIsChecking(false);
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth, setIsLoading]);

  if (isChecking) {
    return <LoadingOverlay message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
