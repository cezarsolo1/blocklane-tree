import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { RequestOtp } from '@/components/auth/RequestOtp';
import { VerifyOtp } from '@/components/auth/VerifyOtp';

interface LoginFormProps {
  onSuccess?: () => void;
}

type AuthStep = 'request' | 'verify';

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [step, setStep] = useState<AuthStep>('request');
  const [email, setEmail] = useState('');
  const { requestOtp, verifyOtp, user, loading: authLoading } = useAuth();
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

  const handleOtpSent = (sentEmail: string) => {
    setEmail(sentEmail);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('request');
    setEmail('');
  };

  if (step === 'request') {
    return (
      <RequestOtp
        onOtpSent={handleOtpSent}
        onRequestOtp={requestOtp}
        loading={authLoading}
      />
    );
  }

  return (
    <VerifyOtp
      email={email}
      onVerifyOtp={verifyOtp}
      onBack={handleBack}
      onRequestOtp={requestOtp}
      loading={authLoading}
    />
  );
};
