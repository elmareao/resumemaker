import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import axiosInstance from '../utils/axiosInstance';

// Mock axiosInstance
jest.mock('../utils/axiosInstance');
const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(<Router><RegisterPage /></Router>);
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
  });

  it('allows users to type into form fields', () => {
    render(<Router><RegisterPage /></Router>);
    const emailInput = screen.getByPlaceholderText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/^password/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    expect(emailInput.value).toBe('newuser@example.com');
    expect(passwordInput.value).toBe('newpassword123');
    expect(confirmPasswordInput.value).toBe('newpassword123');
  });

  it('shows error if passwords do not match', async () => {
    render(<Router><RegisterPage /></Router>);
    fireEvent.change(screen.getByPlaceholderText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error if password is too short', async () => {
    render(<Router><RegisterPage /></Router>);
    fireEvent.change(screen.getByPlaceholderText(/^password/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
  });
  
  it('shows error if fields are empty', async () => {
    render(<Router><RegisterPage /></Router>);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  it('handles successful registration and navigates to login', async () => {
    mockedAxiosInstance.post.mockResolvedValue({
      status: 201,
      data: { message: 'Registration successful' }, // Backend might return user/token, but not used here directly
    });
    jest.useFakeTimers(); // Use fake timers for setTimeout

    render(<Router><RegisterPage /></Router>);
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'success@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        email: 'success@example.com',
        password: 'password123',
      });
    });
    expect(await screen.findByText(/registration successful! please login/i)).toBeInTheDocument();
    
    jest.advanceTimersByTime(2000); // Fast-forward timers

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
            state: { successMessage: 'Registration successful! Please login.' } 
        });
    });
    jest.useRealTimers(); // Restore real timers
  });

  it('handles failed registration (e.g., email exists)', async () => {
    render(<Router><RegisterPage /></Router>);
    mockedAxiosInstance.post.mockRejectedValue({
      response: { data: { message: 'User already exists with this email' } },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/user already exists with this email/i)).toBeInTheDocument();
  });
  
  it('navigates to login page when "Sign in here" link is clicked', () => {
    render(<Router><RegisterPage /></Router>);
    expect(screen.getByText(/sign in here/i).closest('a')).toHaveAttribute('href', '/login');
  });
});
