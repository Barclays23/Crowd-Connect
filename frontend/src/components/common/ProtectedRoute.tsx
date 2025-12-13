// frontend/src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { FC } from 'react';
import { toast } from 'react-toastify';


interface ProtectedRouteProps {
//   children: ReactNode;
  requireAdmin?: boolean; // Optional: if true → only admins
}



export const ProtectedRoute: FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Loading Spinner or return null while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home or login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    toast.success('Access denied. Admins only.');
    return <Navigate to="/" replace />;
    // Or show a 403 page: <Navigate to="/unauthorized" />
  }

  return <Outlet />;
};