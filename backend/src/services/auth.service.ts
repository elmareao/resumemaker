import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model'; // Assuming User model is exported from models/index.ts or directly
// import { sequelize } from '../models'; // Import sequelize instance if not using User.create directly
import config from '../config'; // Import the centralized config

// Ensure JWT_SECRET is loaded (ideally from a config file that loads .env)
const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

export const registerUser = async (userData: any) => {
  const { email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password_hash,
    // other fields like plan_type will use defaults from model
  });

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { user: { id: user.id, email: user.email, plan_type: user.plan_type }, token };
};

// Export hashPassword to be used by other services/controllers if needed
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const loginUser = async (loginData: any) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials (user not found)');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials (password mismatch)');
  }

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { user: { id: user.id, email: user.email, plan_type: user.plan_type }, token };
};
