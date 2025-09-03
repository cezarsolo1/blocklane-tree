import { useAuth } from '@/modules/auth/AuthProvider';

export const LogoutButton = () => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
    >
      Logout ({user?.email})
    </button>
  );
};
