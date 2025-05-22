import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
// import { authMiddleware } from '../middleware/auth.middleware'; // To be added later for protected routes

const router = Router();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken); // Potentially protected
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
export default router;
