import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import axiosInstance from '../utils/axiosInstance';

// Mock axiosInstance
jest.mock('../utils/axiosInstance');
const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    render(<Router><ForgotPasswordPage /></Router>);
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/remembered your password\?/i)).toBeInTheDocument();
  });

  it('allows user to type into email field', () => {
    render(<Router><ForgotPasswordPage /></Router>);
    const emailInput = screen.getByPlaceholderText(/email address/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('shows error if email is not provided', async () => {
    render(<Router><ForgotPasswordPage /></Router>);
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
  });

  it('handles successful submission (simulating backend always returns success-like message)', async () => {
    mockedAxiosInstance.post.mockResolvedValue({
      status: 200,
      data: { message: 'If an account with that email exists, a password reset link has been sent.' },
    });

    render(<Router><ForgotPasswordPage /></Router>);
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com',
      });
    });
    expect(await screen.findByText(/if an account with that email exists, a password reset link has been sent/i)).toBeInTheDocument();
    // Check if email field is cleared
    const emailInput = screen.getByPlaceholderText(/email address/i) as HTMLInputElement;
    expect(emailInput.value).toBe('');
  });

  it('handles submission when API call fails (still shows generic success message)', async () => {
    mockedAxiosInstance.post.mockRejectedValue({
        response: { data: { message: 'Some internal server error' } }, // This error won't be shown to user
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    render(<Router><ForgotPasswordPage /></Router>);
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'error@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'error@example.com',
      });
    });
    // As per implementation, it should still show the generic success message to prevent enumeration
    expect(await screen.findByText(/if an account with that email exists, a password reset link has been sent/i)).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
  
  it('navigates to login page when "Back to Login" link is clicked', () => {
    render(<Router><ForgotPasswordPage /></Router>);
    expect(screen.getByText(/back to login/i).closest('a')).toHaveAttribute('href', '/login');
  });
});
