import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { RefreshToken, User } from '../models'; // Assuming models are exported from models/index
import config from '../config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

    const { user, accessToken } = await authService.loginUser({ email, password });

    // Generate Refresh Token
    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshTokenExpirationDays);

    try {
      await RefreshToken.create({
        token: refreshTokenString,
        userId: user.id,
        expiresAt: expiresAt,
      });
    } catch (dbError: any) {
        console.error('Error saving refresh token:', dbError);
        // If refresh token saving fails, it's a server error.
        // Depending on policy, you might choose to not log the user in,
        // or log them in but without a refresh token.
        // For now, let's return a 500.
        return res.status(500).json({ message: 'Login succeeded but failed to create refresh token.' });
    }
    

    res.status(200).json({
      message: 'Login successful',
      user: { // Send back some user info, but not sensitive data like password_hash
        id: user.id,
        email: user.email,
        plan_type: user.plan_type,
      },
      accessToken,
      refreshToken: refreshTokenString,
    });

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
  const { refreshToken: incomingRefreshToken } = req.body;

  if (!incomingRefreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  try {
    const existingToken = await RefreshToken.findOne({
      where: { token: incomingRefreshToken },
      include: [User], // Include User to generate new access token
    });

    if (!existingToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    if (existingToken.isUsed) {
      // Token has already been used (potential replay attack)
      // Optionally, invalidate all tokens for this user as a security measure
      console.warn(`Attempted reuse of refresh token: ${existingToken.id} for user ${existingToken.userId}`);
      return res.status(403).json({ message: 'Refresh token has already been used.' });
    }

    if (existingToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Refresh token has expired.' });
    }

    const user = existingToken.user;
    if (!user) {
        // Should not happen if DB integrity is maintained
        console.error(`User not found for refresh token ${existingToken.id}`);
        return res.status(401).json({ message: 'User associated with token not found.' });
    }

    // Token Rotation: Mark old token as used and create a new one
    existingToken.isUsed = true;
    await existingToken.save();

    const newRefreshTokenString = crypto.randomBytes(64).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + config.jwt.refreshTokenExpirationDays);

    await RefreshToken.create({
      token: newRefreshTokenString,
      userId: user.id,
      expiresAt: newExpiresAt,
    });

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    });

  } catch (error: any) {
    console.error('Error in refreshToken controller:', error);
    res.status(500).json({ message: 'Internal server error during token refresh.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  console.log('Auth_Controller: forgotPassword');
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      // User found, proceed to generate and store token
      const plainToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await authService.hashPassword(plainToken); // Re-use hashing logic

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + config.jwt.passwordResetTokenExpirationMinutes);

      // Invalidate previous tokens for this user (optional but good practice)
      await PasswordResetToken.destroy({ where: { userId: user.id } });

      await PasswordResetToken.create({
        token: hashedToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      const resetLink = `${config.frontendURL}/reset-password?token=${plainToken}`;
      console.log('Password Reset Link (for development):', resetLink);
      // In a real application, you would send an email here with resetLink
    } else {
      // User not found. Log this for server-side awareness if needed during dev.
      console.log(`Password reset requested for non-existent email: ${email}`);
    }

    // Always return a generic success message to avoid email enumeration
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error: any) {
    console.error('Error in forgotPassword controller:', error);
    // Generic error for the client, but log specific error on server
    res.status(500).json({ message: 'An error occurred while attempting to reset password.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log('Auth_Controller: resetPassword');
  const { token: plainToken, newPassword } = req.body;

  if (!plainToken || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  // Optional: Add password complexity validation here (e.g., min length)
  if (newPassword.length < 8) { // Example: Minimum 8 characters
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  try {
    // Hash the plain token received from the client to find it in the database
    const hashedToken = await authService.hashPassword(plainToken);

    const passwordResetToken = await PasswordResetToken.findOne({
      where: { token: hashedToken },
      include: [User], // Include the User model to get user details
    });

    if (!passwordResetToken) {
      return res.status(400).json({ message: 'Invalid or expired token. (Not Found)' });
    }

    if (passwordResetToken.expiresAt < new Date()) {
      // Token has expired, delete it
      await passwordResetToken.destroy();
      return res.status(400).json({ message: 'Invalid or expired token. (Expired)' });
    }

    const user = passwordResetToken.user;
    if (!user) {
      // Should not happen if DB integrity is maintained
      console.error(`User not found for password reset token ID: ${passwordResetToken.id}`);
      await passwordResetToken.destroy(); // Clean up invalid token
      return res.status(400).json({ message: 'Invalid token. (User not associated)' });
    }

    // Update user's password
    user.password_hash = await authService.hashPassword(newPassword);
    await user.save();

    // Delete the used password reset token
    await passwordResetToken.destroy();

    // Optionally, invalidate all active refresh tokens for this user for enhanced security
    await RefreshToken.destroy({ where: { userId: user.id } });


    console.log(`Password for user ${user.email} has been reset successfully.`);
    return res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error('Error in resetPassword controller:', error);
    // Generic error for the client
    res.status(500).json({ message: 'An error occurred while attempting to reset the password.' });
  }
};
