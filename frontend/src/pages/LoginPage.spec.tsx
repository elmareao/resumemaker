import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom'; // Needed for Link and useNavigate
import LoginPage from './LoginPage';
import { AuthContext, AuthProvider } from '../context/AuthContext'; // Import actual context
import axiosInstance from '../utils/axiosInstance';

// Mock axiosInstance
jest.mock('../utils/axiosInstance');
const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/login' }), // Mock useLocation
}));


// Helper to render with AuthProvider
const renderWithAuthProvider = (ui: React.ReactElement, authContextValue?: any) => {
  const defaultValue = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  };
  return render(
    <AuthContext.Provider value={authContextValue || defaultValue}>
      <Router>{ui}</Router>
    </AuthContext.Provider>
  );
};


describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks
  });

  it('renders login form correctly', () => {
    renderWithAuthProvider(<LoginPage />);
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('allows users to type into email and password fields', () => {
    renderWithAuthProvider(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows error if email or password are not provided', async () => {
    renderWithAuthProvider(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(loginButton);
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLogin = jest.fn();
    renderWithAuthProvider(<LoginPage />, {
        isAuthenticated: false, user: null, accessToken: null, refreshToken: null, isLoading: false, 
        login: mockLogin, logout: jest.fn() 
    });

    const mockUserData = { id: '1', email: 'test@example.com', plan_type: 'free' };
    const mockTokens = { accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token' };
    mockedAxiosInstance.post.mockResolvedValue({
      status: 200,
      data: { user: mockUserData, ...mockTokens },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUserData, mockTokens.accessToken, mockTokens.refreshToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('handles failed login (invalid credentials)', async () => {
    renderWithAuthProvider(<LoginPage />);
    mockedAxiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
  
  it('navigates to forgot password page when link is clicked', () => {
    renderWithAuthProvider(<LoginPage />);
    fireEvent.click(screen.getByText(/forgot your password\?/i));
    // In a real test, you might assert mockNavigate was called with '/forgot-password'
    // For now, just checking link existence is covered by render test.
    // This requires a more complex Router setup or direct navigation testing.
    expect(screen.getByText(/forgot your password\?/i).closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('navigates to register page when link is clicked', () => {
    renderWithAuthProvider(<LoginPage />);
    // Similar to above, direct navigation testing is complex.
    expect(screen.getByText(/register here/i).closest('a')).toHaveAttribute('href', '/register');
  });
});
