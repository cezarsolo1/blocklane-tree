import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'TENANT' | 'PM' | 'CONTRACTOR';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Store the current path for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Note: Role checking would require fetching user profile
  // For now, we'll just check if user is authenticated
  
  return <>{children}</>;
};