import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import cvRoutes from './cv.routes';
import templateRoutes from './template.routes';
// Import subscription/payment routes here when created

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // As per spec: /api/users/me
router.use('/cvs', cvRoutes);
router.use('/templates', templateRoutes);
// router.use('/subscriptions', subscriptionRoutes);
// router.use('/payments', paymentRoutes);

export default router;
