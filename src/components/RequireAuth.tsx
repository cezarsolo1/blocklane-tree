/**
 * RequireAuth Component
 * 
 * Protects routes by checking authentication and allowlist status.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading, isAllowlisted } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No session - redirect to auth page
        navigate('/', { replace: true });
      } else if (!isAllowlisted) {
        // User is logged in but not allowlisted - they will be signed out by AuthProvider
        // This effect will trigger again when they're signed out
        return;
      }
    }
  }, [user, loading, isAllowlisted, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  if (!isAllowlisted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Access Denied</div>
          <div className="text-sm text-gray-600">Your email is not authorized for this application.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
