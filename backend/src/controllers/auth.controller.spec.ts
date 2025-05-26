import { Request, Response } from 'express';
import * as authController from './auth.controller';
import * as authService from '../services/auth.service';
import { User, RefreshToken, PasswordResetToken } from '../models';
import config from '../config';
import crypto from 'crypto'; // For mocking token generation if needed
import jwt from 'jsonwebtoken'; // For mocking token generation if needed

// Mock services and models
jest.mock('../services/auth.service');
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    // Add other methods as needed by tests
  },
  RefreshToken: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    // Add other methods as needed by tests
  },
  PasswordResetToken: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    // Add other methods as needed by tests
  },
}));

// Mock config (ensure values are consistent with what controllers expect)
jest.mock('../config', () => ({
  __esModule: true, // This is important for ES6 modules
  default: {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h',
      refreshTokenExpirationDays: 7,
      passwordResetTokenExpirationMinutes: 60,
    },
    frontendURL: 'http://localhost:3000',
    // Add other config properties if your controllers use them
  },
}));


const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => {
  return {
    body,
    params,
    query,
  } as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Auth Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    res = mockResponse();
  });

  // --- Refresh Token Tests ---
  describe('refreshToken', () => {
    it('should return new tokens for a valid refresh token', async () => {
      req = mockRequest({ refreshToken: 'valid-refresh-token' });
      const mockUserInstance = { id: 'user-1', email: 'test@example.com', save: jest.fn() };
      const mockTokenInstance = {
        id: 'rt-1',
        token: 'valid-refresh-token',
        userId: 'user-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires tomorrow
        user: mockUserInstance,
        save: jest.fn().mockResolvedValue(true),
      };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockTokenInstance);
      (RefreshToken.create as jest.Mock).mockResolvedValue({ token: 'new-rt', userId: 'user-1', expiresAt: new Date() });
      // Mock jwt.sign if it's directly used in controller, otherwise assume service handles it
      jest.spyOn(jwt, 'sign').mockReturnValue('new-access-token' as any);


      await authController.refreshToken(req, res);

      expect(RefreshToken.findOne).toHaveBeenCalledWith({ where: { token: 'valid-refresh-token' }, include: [User] });
      expect(mockTokenInstance.save).toHaveBeenCalled(); // Old token marked as used
      expect(RefreshToken.create).toHaveBeenCalled(); // New token created
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'new-access-token',
        refreshToken: expect.any(String), // New refresh token
      }));
    });

    it('should return 401 for an invalid (not found) refresh token', async () => {
        req = mockRequest({ refreshToken: 'invalid-token' });
        (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);
        await authController.refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid refresh token.' });
    });

    it('should return 403 for an expired refresh token', async () => {
        req = mockRequest({ refreshToken: 'expired-token' });
        const mockTokenInstance = {
            isUsed: false,
            expiresAt: new Date(Date.now() - 10000), // Expired
            user: { id: 'user-1', email: 'test@example.com' },
        };
        (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockTokenInstance);
        await authController.refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token has expired.' });
    });
    
    it('should return 403 for a used refresh token', async () => {
        req = mockRequest({ refreshToken: 'used-token' });
        const mockTokenInstance = {
            isUsed: true,
            expiresAt: new Date(Date.now() + 100000), // Not expired
            user: { id: 'user-1', email: 'test@example.com' },
        };
        (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockTokenInstance);
        await authController.refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token has already been used.' });
    });

    it('should return 400 if no refresh token is provided', async () => {
        req = mockRequest({}); // No refreshToken in body
        await authController.refreshToken(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token is required.' });
    });
  });

  // --- Forgot Password Tests ---
  describe('forgotPassword', () => {
    it('should return 200 and attempt to store token for an existing user email', async () => {
      req = mockRequest({ email: 'user@example.com' });
      const mockUser = { id: 'user-exist', email: 'user@example.com' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authService.hashPassword as jest.Mock).mockResolvedValue('hashed-reset-token'); // Mock hashing
      (PasswordResetToken.create as jest.Mock).mockResolvedValue({ token: 'hashed-reset-token', userId: 'user-exist' });
      const consoleSpy = jest.spyOn(console, 'log'); // Spy on console.log

      await authController.forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(PasswordResetToken.destroy).toHaveBeenCalledWith({ where: { userId: 'user-exist' } }); // Old tokens destroyed
      expect(PasswordResetToken.create).toHaveBeenCalledWith(expect.objectContaining({
        token: 'hashed-reset-token',
        userId: 'user-exist',
        expiresAt: expect.any(Date),
      }));
      expect(consoleSpy).toHaveBeenCalledWith('Password Reset Link (for development):', expect.stringContaining('http://localhost:3000/reset-password?token='));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If an account with that email exists, a password reset link has been sent.' });
      consoleSpy.mockRestore();
    });

    it('should return 200 but not store token for a non-existing user email', async () => {
      req = mockRequest({ email: 'nouser@example.com' });
      (User.findOne as jest.Mock).mockResolvedValue(null); // User not found

      await authController.forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'nouser@example.com' } });
      expect(PasswordResetToken.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If an account with that email exists, a password reset link has been sent.' });
    });
    
    it('should return 400 if email is not provided', async () => {
        req = mockRequest({});
        await authController.forgotPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is required.' });
    });
  });

  // --- Reset Password Tests ---
  describe('resetPassword', () => {
    const plainToken = 'plain-reset-token';
    const newPassword = 'newSecurePassword123';

    it('should reset password for a valid token and new password', async () => {
      req = mockRequest({ token: plainToken, newPassword });
      const mockUserInstance = { 
        id: 'user-reset', 
        email: 'reset@example.com', 
        password_hash: 'old-hash',
        save: jest.fn().mockResolvedValue(true) 
      };
      const mockResetTokenInstance = {
        id: 'prt-1',
        token: 'hashed-plain-reset-token', // Assume this is the hashed version of plainToken
        userId: 'user-reset',
        expiresAt: new Date(Date.now() + 1000 * 60 * 30), // Expires in 30 mins
        user: mockUserInstance,
        destroy: jest.fn().mockResolvedValue(true),
      };
      (authService.hashPassword as jest.Mock)
        .mockResolvedValueOnce('hashed-plain-reset-token') // For finding the token
        .mockResolvedValueOnce('hashed-newSecurePassword123'); // For saving new password
      (PasswordResetToken.findOne as jest.Mock).mockResolvedValue(mockResetTokenInstance);
      (RefreshToken.destroy as jest.Mock).mockResolvedValue(1); // Assume one refresh token destroyed

      await authController.resetPassword(req, res);

      expect(PasswordResetToken.findOne).toHaveBeenCalledWith({ where: { token: 'hashed-plain-reset-token' }, include: [User] });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockUserInstance.password_hash).toBe('hashed-newSecurePassword123');
      expect(mockResetTokenInstance.destroy).toHaveBeenCalled();
      expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { userId: 'user-reset' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully.' });
    });

    it('should return 400 for an invalid (not found) token', async () => {
      req = mockRequest({ token: 'invalid-plain-token', newPassword });
      (authService.hashPassword as jest.Mock).mockResolvedValueOnce('hashed-invalid-plain-token');
      (PasswordResetToken.findOne as jest.Mock).mockResolvedValue(null);

      await authController.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token. (Not Found)' });
    });

    it('should return 400 for an expired token', async () => {
        req = mockRequest({ token: plainToken, newPassword });
        (authService.hashPassword as jest.Mock).mockResolvedValueOnce('hashed-plain-reset-token');
        const mockResetTokenInstance = {
            expiresAt: new Date(Date.now() - 10000), // Expired
            destroy: jest.fn().mockResolvedValue(true),
        };
        (PasswordResetToken.findOne as jest.Mock).mockResolvedValue(mockResetTokenInstance);
  
        await authController.resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token. (Expired)' });
        expect(mockResetTokenInstance.destroy).toHaveBeenCalled();
      });

    it('should return 400 if new password is too short', async () => {
        req = mockRequest({ token: plainToken, newPassword: 'short' });
        // No need to mock findOne or hashPassword if validation fails first
        await authController.resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters long.' });
    });
    
    it('should return 400 if token or new password is not provided', async () => {
        req = mockRequest({ newPassword: 'validpassword' }); // Missing token
        await authController.resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token and new password are required.' });

        req = mockRequest({ token: 'validtoken' }); // Missing newPassword
        await authController.resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token and new password are required.' });
    });
  });
});
