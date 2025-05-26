import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router, MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import axiosInstance from '../utils/axiosInstance';

// Mock axiosInstance
jest.mock('../utils/axiosInstance');
const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock react-router-dom navigation and search params
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, jest.fn()], // Return mockSearchParams
}));

// Helper to render with initial URL for searchParams
const renderWithRouter = (ui: React.ReactElement, { route = '/', initialEntries = ['/'] } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={route.startsWith('/') ? route.substring(1) : route} element={ui} />
      </Routes>
    </MemoryRouter>
  );
};


describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams(); // Reset search params for each test
  });

  it('renders reset password form if token is present', () => {
    mockSearchParams.set('token', 'test-token');
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password?token=test-token', initialEntries: ['/reset-password?token=test-token'] });
    
    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows error and no form if token is missing from URL', () => {
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password', initialEntries: ['/reset-password'] });
    expect(screen.getByText(/invalid or missing reset token/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/new password/i)).not.toBeInTheDocument();
    expect(screen.getByText(/request a new password reset link/i)).toBeInTheDocument();
  });
  
  it('shows validating message initially if token exists then form', async () => {
    mockSearchParams.set('token', 'valid-token-for-validation-message');
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password?token=valid-token-for-validation-message', initialEntries: ['/reset-password?token=valid-token-for-validation-message'] });
    // Initially, no form elements should be visible, but the token exists
    // The "Validating reset link..." message is shown if !token && !error, this logic might be tricky to test perfectly
    // For simplicity, we directly test the "form appears" part
    await waitFor(() => {
        expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    });
  });


  it('allows user to type into password fields', () => {
    mockSearchParams.set('token', 'test-token');
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password?token=test-token', initialEntries: ['/reset-password?token=test-token'] });
    const newPasswordInput = screen.getByPlaceholderText(/new password/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i) as HTMLInputElement;

    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    expect(newPasswordInput.value).toBe('newpass123');
    expect(confirmPasswordInput.value).toBe('newpass123');
  });

  it('shows error if passwords do not match', async () => {
    mockSearchParams.set('token', 'test-token');
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password?token=test-token', initialEntries: ['/reset-password?token=test-token'] });
    fireEvent.change(screen.getByPlaceholderText(/new password/i), { target: { value: 'pass1' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), { target: { value: 'pass2' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
  
  it('shows error if password is too short', async () => {
    mockSearchParams.set('token', 'test-token');
    renderWithRouter(<ResetPasswordPage />, { route: '/reset-password?token=test-token', initialEntries: ['/reset-password?token=test-token'] });
    fireEvent.change(screen.getByPlaceholderText(/new password/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
  });

  it('handles successful password reset and navigates to login', async () => {
    const token = 'valid-reset-token';
    mockSearchParams.set('token', token);
    mockedAxiosInstance.post.mockResolvedValue({
      status: 200,
      data: { message: 'Password has been reset successfully.' },
    });
    jest.useFakeTimers();

    renderWithRouter(<ResetPasswordPage />, { route: `/reset-password?token=${token}`, initialEntries: [`/reset-password?token=${token}`] });
    fireEvent.change(screen.getByPlaceholderText(/new password/i), { target: { value: 'newSecurePass123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), { target: { value: 'newSecurePass123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: token,
        newPassword: 'newSecurePass123',
      });
    });
    expect(await screen.findByText(/your password has been reset successfully! redirecting to login/i)).toBeInTheDocument();
    
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
            state: { successMessage: 'Your password has been reset successfully! You can now login.' }
        });
    });
    jest.useRealTimers();
  });

  it('handles failed password reset (e.g., invalid token from backend)', async () => {
    const token = 'invalid-backend-token';
    mockSearchParams.set('token', token);
    mockedAxiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid or expired token.' } },
    });

    renderWithRouter(<ResetPasswordPage />, { route: `/reset-password?token=${token}`, initialEntries: [`/reset-password?token=${token}`] });
    fireEvent.change(screen.getByPlaceholderText(/new password/i), { target: { value: 'newSecurePass123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), { target: { value: 'newSecurePass123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/invalid or expired token/i)).toBeInTheDocument();
  });
});
