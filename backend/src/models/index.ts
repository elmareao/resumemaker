import { Sequelize } from 'sequelize-typescript';
import { User } from './user.model';
import { Cv } from './cv.model';
import { Template } from './template.model';
import config from '../config'; // Import the centralized config

// dotenv.config() is now handled in config/index.ts, so no need to call it here.

const sequelize = new Sequelize({
  database: config.database.name,
  dialect: 'postgres',
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  models: [User, Cv, Template],
  logging: config.isDevelopment ? console.log : false, // Log SQL in dev, none in prod
  dialectOptions: {
    ssl: config.database.ssl ? { require: true, rejectUnauthorized: false } : false,
  },
});

export { sequelize, User, Cv, Template };

// Optional: test connection (can be removed or kept for debugging)
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }
// if (config.isDevelopment) { // Only run test connection in development
//   testConnection();
// }
