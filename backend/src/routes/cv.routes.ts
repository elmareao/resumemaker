import { Router } from 'express';
import * as cvController from '../controllers/cv.controller';
// import { authMiddleware } from '../middleware/auth.middleware';
// import multer from 'multer'; // For file uploads
// const upload = multer({ dest: 'uploads/' }); // Basic multer config

const router = Router();
// router.use(authMiddleware); // All CV routes are protected
router.post('/upload', /* upload.single('pdf'), */ cvController.uploadCv);
router.post('/', cvController.createCv);
router.get('/', cvController.getUserCvs);
router.get('/:id', cvController.getCvById);
router.put('/:id', cvController.updateCv);
router.delete('/:id', cvController.deleteCv);
router.post('/:id/download', cvController.downloadCv);
export default router;
