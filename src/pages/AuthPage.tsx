/**
 * Auth Page
 * 
 * Login/Register page for unauthenticated users.
 */

import { LoginForm } from '@/modules/auth/LoginForm';

export const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};
