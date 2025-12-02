// src/routes/PublicRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { FC } from 'react';


export const PublicRoute: FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // loading spinner or return null while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // If already logged in → redirect to home (or previous page)
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};