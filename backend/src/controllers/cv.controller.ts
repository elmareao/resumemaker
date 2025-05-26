import { Request, Response } from 'express';
import PdfParserService from '../services/pdfParser.service';
import { Cv } from '../models'; // Assuming Cv model is exported from models/index.ts
import { UserRequest } from '../middleware/auth.middleware'; // To get req.user

export const uploadCv = async (req: UserRequest, res: Response) => {
  console.log('Cv_Controller: uploadCv');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    if (!req.user || !req.user.id) {
      // This case should ideally be caught by authMiddleware, but as a safeguard:
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    const pdfBuffer = req.file.buffer;
    let extractedData;

    try {
      extractedData = await PdfParserService.parseCvPdf(pdfBuffer);
    } catch (parseError: any) {
      console.error('Error parsing PDF:', parseError);
      return res.status(400).json({ message: `Failed to parse PDF: ${parseError.message || 'Unknown parsing error'}` });
    }

    const userId = req.user.id;
    // Generate a default title, e.g., using filename or a timestamp
    const originalFilename = req.file.originalname || 'Uploaded CV';
    const title = `${originalFilename.replace(/\.pdf$/i, '')} - ${new Date().toLocaleDateString()}`;


    let newCv;
    try {
      newCv = await Cv.create({
        user_id: userId,
        title: title,
        cv_data: extractedData, // The Cv model's cv_data field should be JSONB or TEXT
        template_id: null, // Default to null or a predefined default template
      });
    } catch (dbError: any) {
      console.error('Database error while saving CV:', dbError);
      return res.status(500).json({ message: `Database error: ${dbError.message || 'Failed to save CV'}` });
    }

    console.log(`CV created with ID: ${newCv.id} for user ${userId}`);
    return res.status(201).json({
      message: 'CV uploaded and parsed successfully.',
      cvId: newCv.id,
      extractedData: newCv.cv_data,
    });

  } catch (error: any) {
    console.error('Unexpected error in uploadCv:', error);
    // Check if it's a multer error (e.g. file type)
    if (error.code && error.message) { // Multer errors often have a 'code' property
        if (error.message === 'Only PDF files are allowed!') {
             return res.status(400).json({ message: error.message });
        }
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    res.status(500).json({ message: 'Internal server error while uploading CV.' });
  }
};

export const createCv = async (req: Request, res: Response) => {
  console.log('Cv_Controller: createCv');
  res.status(501).json({ message: 'Not Implemented' });
};
export const getUserCvs = async (req: Request, res: Response) => {
  console.log('Cv_Controller: getUserCvs');
  res.status(501).json({ message: 'Not Implemented' });
};
export const getCvById = async (req: Request, res: Response) => {
  console.log('Cv_Controller: getCvById');
  res.status(501).json({ message: 'Not Implemented' });
};

export const updateCv = async (req: UserRequest, res: Response) => {
  console.log('Cv_Controller: updateCv');
  const { id: cvId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    // This should ideally be caught by authMiddleware
    return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
  }

  const { cv_data, title, template_customization } = req.body;

  // Input Validation
  if (!cv_data || typeof cv_data !== 'object') {
    return res.status(400).json({ message: 'Invalid input: cv_data is required and must be an object.' });
  }
  // Optional: Validate title if provided
  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ message: 'Invalid input: title must be a string.' });
  }
  // Optional: Validate template_customization if provided
  if (template_customization !== undefined && typeof template_customization !== 'object') {
    return res.status(400).json({ message: 'Invalid input: template_customization must be an object.' });
  }


  try {
    // Find the CV ensuring it belongs to the authenticated user
    const cv = await Cv.findOne({ where: { id: cvId, user_id: userId } });

    if (!cv) {
      // CV not found or user does not have permission
      return res.status(404).json({ message: 'CV not found or access denied.' });
    }

    // Update CV fields
    cv.cv_data = cv_data;
    if (title !== undefined) {
      cv.title = title;
    }
    if (template_customization !== undefined) {
      // Assuming template_customization is also a JSONB field or similar
      cv.template_customization = template_customization; 
    }
    // updated_at is handled by Sequelize automatically

    await cv.save();

    console.log(`CV with ID: ${cvId} updated successfully for user ${userId}.`);
    return res.status(200).json(cv.toJSON());

  } catch (error: any) {
    console.error(`Error updating CV with ID ${cvId}:`, error);
    // Check for specific Sequelize errors if needed, e.g., validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error.', errors: error.errors.map((e: any) => e.message) });
    }
    res.status(500).json({ message: 'Internal server error while updating CV.' });
  }
};

export const deleteCv = async (req: Request, res: Response) => {
  console.log('Cv_Controller: deleteCv');
  res.status(501).json({ message: 'Not Implemented' });
};
export const downloadCv = async (req: Request, res: Response) => {
  console.log('Cv_Controller: downloadCv');
  res.status(501).json({ message: 'Not Implemented' });
};
