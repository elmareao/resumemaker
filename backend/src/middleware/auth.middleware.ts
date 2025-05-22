import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model'; // Or from '../models'

// Extend Express Request type to include 'user' property
export interface AuthenticatedRequest extends Request {
  user?: User; // Or a more specific type like { id: string; email: string; }
}
import config from '../config'; // Import the centralized config

const JWT_SECRET = config.jwt.secret; // Use the same secret as in auth.service

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; iat: number; exp: number };
    
    // Optional: Check if user still exists in DB, though this adds overhead.
    // For stateless JWT, the token's validity is usually enough.
    // If checking against DB:
    // const user = await User.findByPk(decoded.id);
    // if (!user) {
    //   return res.status(401).json({ message: 'User not found' });
    // }
    // req.user = user; // Attach full user model instance

    // Attach decoded payload to request object (more lightweight)
    req.user = { id: decoded.id, email: decoded.email } as User; // Cast to User or a simplified UserPayload interface

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
