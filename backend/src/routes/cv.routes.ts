import { Router } from 'express';
import * as cvController from '../controllers/cv.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import upload from '../middleware/multer.middleware';

const router = Router();

// All CV routes are protected
router.use(authMiddleware);

// Route for uploading a CV PDF
router.post(
  '/upload',
  upload.single('cv_pdf'), // 'cv_pdf' is the field name in the form-data
  cvController.uploadCv,
);

router.post('/', cvController.createCv);
router.get('/', cvController.getUserCvs);
router.get('/:id', cvController.getCvById);
router.put('/:id', cvController.updateCv);
router.delete('/:id', cvController.deleteCv);
router.post('/:id/download', cvController.downloadCv);
export default router;
