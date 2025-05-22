import { Router } from 'express';
import * as userController from '../controllers/user.controller';
// import { authMiddleware } from '../middleware/auth.middleware'; // To be added later

const router = Router();
// Assuming authMiddleware will be added here later:
// router.use(authMiddleware); 
router.get('/me', userController.getCurrentUser); // Protected
router.put('/me', userController.updateCurrentUser); // Protected
export default router;
