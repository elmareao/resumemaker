import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Add more validation as needed (e.g., password strength)

    const result = await authService.registerUser({ email, password });
    res.status(201).json(result);
  } catch (error: any) {
    // Differentiate error types for better client feedback
    if (error.message.includes('User already exists')) {
        return res.status(409).json({ message: error.message });
    }
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    res.status(200).json(result);
  } catch (error: any) {
    // Differentiate between user not found/password mismatch (401) vs other errors (500)
    if (error.message.includes('Invalid credentials')) {
         return res.status(401).json({ message: error.message });
    }
    // User already exists is more relevant for registration, but good to be aware
    // if (error.message.includes('User already exists')) { 
    //      return res.status(409).json({ message: error.message });
    // }
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

// Keep other controller functions as stubs for now
export const refreshToken = async (req: Request, res: Response) => {
  console.log('Auth_Controller: refreshToken');
  res.status(501).json({ message: 'Not Implemented' });
};
export const forgotPassword = async (req: Request, res: Response) => {
  console.log('Auth_Controller: forgotPassword');
  res.status(501).json({ message: 'Not Implemented' });
};
export const resetPassword = async (req: Request, res: Response) => {
  console.log('Auth_Controller: resetPassword');
  res.status(501).json({ message: 'Not Implemented' });
};
