import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { AuthProvider } from '@/modules/auth/AuthProvider';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
  })),
  rpc: vi.fn()
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
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

const renderAuthPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    
    // Default session state
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null }
    });
  });

  it('blocks signup with non-allowlisted email', async () => {
    // Mock RPC to return false (not allowlisted)
    mockSupabaseClient.rpc.mockResolvedValue({
      data: false,
      error: null
    });

    renderAuthPage();

    // Switch to signup mode
    fireEvent.click(screen.getByText('Need an account? Sign Up'));

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'unauthorized@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form using the submit button
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email not authorized for registration')).toBeInTheDocument();
    });

    // Verify RPC was called
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('auth_is_email_allowed', {
      p_email: 'unauthorized@example.com'
    });

    // Verify signup was not called
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('allows signup with allowlisted email', async () => {
    // Mock RPC to return true (allowlisted)
    mockSupabaseClient.rpc.mockResolvedValue({
      data: true,
      error: null
    });

    // Mock successful signup
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { email: 'authorized@example.com' } },
      error: null
    });

    renderAuthPage();

    // Switch to signup mode
    fireEvent.click(screen.getByText('Need an account? Sign Up'));

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'authorized@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form using the submit button
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('auth_is_email_allowed', {
        p_email: 'authorized@example.com'
      });
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'authorized@example.com',
        password: 'password123'
      });
    });
  });

  it('allows signin with allowlisted email', async () => {
    // Mock successful signin
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email: 'authorized@example.com' } },
      error: null
    });

    renderAuthPage();

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'authorized@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form using the submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'authorized@example.com',
        password: 'password123'
      });
    });
  });

  it('shows error on signin failure', async () => {
    // Mock failed signin
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });

    renderAuthPage();

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });

    // Submit form using the submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
