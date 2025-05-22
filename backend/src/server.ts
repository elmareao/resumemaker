import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config'; // Import centralized config
import { sequelize } from './models'; // Import Sequelize instance
import apiRoutes from './routes'; // Import main API router from routes/index.ts

const app: Application = express();

// Middleware
app.use(cors({ origin: config.frontendURL })); // Configure CORS for frontend URL
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api', apiRoutes); // Mount all API routes under /api

// Basic Root Route (optional)
app.get('/', (req: Request, res: Response) => {
  res.send(`CV Builder API is running. NODE_ENV: ${config.nodeEnv}`);
});

// Global Error Handler (basic example, can be expanded)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).send('Something broke!');
});

const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models (optional - in dev, can be useful; in prod, migrations are better)
    // Choose one sync strategy:
    // await sequelize.sync({ force: false }); // Doesn't drop tables if they exist
    // await sequelize.sync({ alter: true }); // Checks current state and performs necessary changes
    if (config.isDevelopment) {
         await sequelize.sync({ alter: true }); // Good for dev to keep schema updated
         console.log('Database synchronized with models (alter:true).');
    }


    // Start the server
    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
      console.log(`API available at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
    process.exit(1); // Exit if DB connection fails or server can't start
  }
};

startServer();

export default app; // Export app for potential testing
