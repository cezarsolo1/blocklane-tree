import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AddressCheck } from '@/pages/AddressCheck';
import { logAddressEvent } from '@/modules/api/logAddressEvent';
import { updateAllowedUser } from '@/modules/api/updateAllowedUser';

// Mock the API modules
vi.mock('@/modules/api/logAddressEvent');
vi.mock('@/modules/api/updateAllowedUser');
const mockLogAddressEvent = vi.mocked(logAddressEvent);
const mockUpdateAllowedUser = vi.mocked(updateAllowedUser);

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              email: 'test@example.com',
              street: 'Test Street',
              house_number: '123',
              postal_code: '1234AB',
              city: 'Amsterdam'
            },
            error: null
          }))
        }))
      }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { user: { email: 'test@example.com' } } }
      }))
    }
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-session-id')
  }
});

// Mock useAuth hook
vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: vi.fn(() => ({
    user: { email: 'test@example.com' },
    loading: false,
    isAllowlisted: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    checkAllowedEmail: vi.fn()
  }))
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

const renderAddressCheck = () => {
  return render(
    <BrowserRouter>
      <AddressCheck />
    </BrowserRouter>
  );
};

describe('AddressCheck Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLogAddressEvent.mockResolvedValue({ ok: true, event_id: 'test-event-id' });
    mockUpdateAllowedUser.mockResolvedValue({ ok: true });
  });

  it('renders address form fields', () => {
    renderAddressCheck();
    
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/house number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suffix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  });

  it('prefills form with allowed user data', async () => {
    renderAddressCheck();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Street')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234AB')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Amsterdam')).toBeInTheDocument();
    });
  });

  it('validates required fields before enabling save', () => {
    renderAddressCheck();
    
    const saveButton = screen.getByText(/save address/i);
    expect(saveButton).toBeDisabled();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    expect(saveButton).not.toBeDisabled();
  });

  it('shows validation error for invalid postal code', () => {
    renderAddressCheck();
    
    const postalCodeInput = screen.getByLabelText(/postal code/i);
    fireEvent.change(postalCodeInput, { target: { value: 'invalid' } });
    fireEvent.blur(postalCodeInput);
    
    expect(screen.getByText(/valid dutch postal code/i)).toBeInTheDocument();
  });

  it('normalizes postal code on blur', () => {
    renderAddressCheck();
    
    const postalCodeInput = screen.getByLabelText(/postal code/i);
    fireEvent.change(postalCodeInput, { target: { value: '1234ab' } });
    fireEvent.blur(postalCodeInput);
    
    expect(postalCodeInput).toHaveValue('1234 AB');
  });

  it('normalizes city name on blur', () => {
    renderAddressCheck();
    
    const cityInput = screen.getByLabelText(/city/i);
    fireEvent.change(cityInput, { target: { value: 'amsterdam' } });
    fireEvent.blur(cityInput);
    
    expect(cityInput).toHaveValue('Amsterdam');
  });

  it('calls both updateAllowedUser and logAddressEvent when save is clicked', async () => {
    renderAddressCheck();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    const saveButton = screen.getByText(/save address/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      // Verify updateAllowedUser was called
      expect(mockUpdateAllowedUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        address: {
          street: 'Test Street',
          house_number: '123',
          house_number_suffix: '',
          postal_code: '1234 AB',
          city: 'Amsterdam',
          country: 'NL'
        }
      });

      // Verify logAddressEvent was called
      expect(mockLogAddressEvent).toHaveBeenCalledWith({
        wizard_session_id: 'test-session-id',
        address: {
          street: 'Test Street',
          house_number: '123',
          house_number_suffix: '',
          postal_code: '1234 AB',
          city: 'Amsterdam',
          country: 'NL'
        },
        profile_hint: {
          email: 'test@example.com'
        }
      });
    });
  });

  it('shows success message after saving', async () => {
    renderAddressCheck();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    const saveButton = screen.getByText(/save address/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/address saved successfully/i)).toBeInTheDocument();
    });
  });

  it('navigates to wizard when continue is clicked', () => {
    renderAddressCheck();
    
    const continueButton = screen.getByText(/continue to wizard/i);
    fireEvent.click(continueButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/wizard');
  });

  it('creates wizard session ID in localStorage', async () => {
    renderAddressCheck();
    
    // Fill in required fields and save
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    const saveButton = screen.getByText(/save address/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('wizard_session_id', 'test-session-id');
    });
  });

  it('shows error message when updateAllowedUser fails', async () => {
    mockUpdateAllowedUser.mockResolvedValue({ ok: false, error: 'Failed to update' });
    
    renderAddressCheck();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    const saveButton = screen.getByText(/save address/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
    });
  });

  it('shows error message when logAddressEvent fails', async () => {
    mockLogAddressEvent.mockResolvedValue({ ok: false, error: 'Failed to log event' });
    
    renderAddressCheck();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Test Street' } });
    fireEvent.change(screen.getByLabelText(/house number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '1234AB' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Amsterdam' } });
    
    const saveButton = screen.getByText(/save address/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to log event/i)).toBeInTheDocument();
    });
  });
});
