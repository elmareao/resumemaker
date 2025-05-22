import { Router } from 'express';
import * as templateController from '../controllers/template.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.get('/', templateController.getTemplates);
router.get('/:templateId', templateController.getTemplateById);
// The subscription/payment routes will be handled in a main API router or dedicated route files.
export default router;
