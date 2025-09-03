import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderRequireAuth = (authState: any) => {
  mockUseAuth.mockReturnValue(authState);
  
  return render(
    <BrowserRouter>
      <RequireAuth>
        <div data-testid="protected-content">Protected Content</div>
      </RequireAuth>
    </BrowserRouter>
  );
};

describe('RequireAuth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading when auth is loading', () => {
    renderRequireAuth({
      user: null,
      loading: true,
      isAllowlisted: false
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to / when no user', () => {
    renderRequireAuth({
      user: null,
      loading: false,
      isAllowlisted: false
    });

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows access denied when user is not allowlisted', () => {
    renderRequireAuth({
      user: { email: 'test@example.com' },
      loading: false,
      isAllowlisted: false
    });

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Your email is not authorized for this application.')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated and allowlisted', () => {
    renderRequireAuth({
      user: { email: 'test@example.com' },
      loading: false,
      isAllowlisted: true
    });

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
