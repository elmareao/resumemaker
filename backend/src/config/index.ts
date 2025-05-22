import dotenv from 'dotenv';

// Load .env file
const envFound = dotenv.config();
if (envFound.error && process.env.NODE_ENV !== 'production') {
  // In development, if .env is missing, it's usually an issue.
  // In production, env vars are typically set directly in the environment.
  // However, for local dev, it's good to have this check.
  // For now, let's not throw an error to allow for environments where .env isn't used (like some CI/CD)
  // but log a warning if not in production and .env is missing.
  console.warn("⚠️  Couldn't find .env file. Relying on system environment variables.");
}


const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASS || '',
    name: process.env.DB_NAME || '',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret', // Fallback for safety, but should be set
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  frontendURL: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate essential configurations
if (!config.jwt.secret || config.jwt.secret === 'default-secret') {
  if (config.isProduction) {
     console.error('FATAL ERROR: JWT_SECRET is not set in production environment.');
     // process.exit(1); // Consider exiting in production if critical configs are missing
  } else {
     console.warn('⚠️ JWT_SECRET is using a default value. Please set it in your .env file for security.');
  }
}
if (!config.database.user || !config.database.password || !config.database.name) {
     if (!config.isProduction) { // In prod, these might be injected differently
         console.warn('⚠️ Database credentials (user, password, or name) are not fully set in .env. Ensure your DB connection is correctly configured.');
     }
}


export default config;
