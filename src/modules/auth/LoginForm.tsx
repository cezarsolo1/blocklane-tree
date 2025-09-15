import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { RequestOtp } from '@/components/auth/RequestOtp';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Watch for successful authentication
  useEffect(() => {
    console.log('LoginForm useEffect - user:', user?.email, 'authLoading:', authLoading);
    if (user && !authLoading) {
      console.log('User authenticated, navigating to address-check');
      navigate('/address-check');
      onSuccess?.();
    }
  }, [user, authLoading, navigate, onSuccess]);

  return <RequestOtp />;
};
