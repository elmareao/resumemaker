import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cvRoutes from './cv.routes'; // The router we are testing
import PdfParserService from '../services/pdfParser.service';
import { Cv, User } from '../models'; // Sequelize models
import { UserRequest } from '../middleware/auth.middleware'; // For typing req.user

// ---- Mocks ----
jest.mock('../services/pdfParser.service');
jest.mock('../models'); // Mock all models from models/index.ts
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: (req: UserRequest, res: Response, next: NextFunction) => {
    // Simulate an authenticated user for most tests
    // For testing unauthenticated cases, this mock will need to be adjusted or overridden per test.
    if (req.headers?.authorization?.startsWith('Bearer validtoken')) {
      req.user = { id: 'mock-user-id', email: 'test@example.com' }; // Mock user object
    } else if (req.headers?.authorization?.startsWith('Bearer no-user-id-token')) {
      req.user = { email: 'test-no-id@example.com' }; // Mock user without id
    } else if (req.headers?.authorization?.startsWith('Bearer unauth')) {
      // Simulate unauthenticated by not setting req.user and calling next
      // or by directly sending a 401, depending on how authMiddleware behaves.
      // For this setup, we'll assume the controller/route handles req.user being undefined.
      // A more direct mock would be to make authMiddleware itself send 401.
       return res.status(401).json({ message: 'Unauthorized from mock' });
    }
    next();
  },
}));


const MockedPdfParserService = PdfParserService as jest.Mocked<typeof PdfParserService>;
const MockedCv = Cv as jest.Mocked<typeof Cv>;
// const MockedUser = User as jest.Mocked<typeof User>; // If User model interactions were needed

// ---- Express App Setup for Testing ----
let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json()); // To parse JSON request bodies
  app.use('/api/cvs', cvRoutes); // Mount the CV routes
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---- Test Suites ----
describe('CV Routes', () => {
  describe('POST /api/cvs/upload', () => {
    const mockParsedCvData = {
      personalInfo: { name: 'John Doe' },
      summary: 'A summary',
      experience: [],
      education: [],
      skills: ['test'],
      languages: [],
      customSections: [],
    };

    it('should upload, parse, and save a CV successfully', async () => {
      MockedPdfParserService.parseCvPdf.mockResolvedValue(mockParsedCvData);
      const mockCvInstance = { id: 'cv-id-123', ...mockParsedCvData, user_id: 'mock-user-id', title: 'Uploaded CV - Date' } as any;
      MockedCv.create.mockResolvedValue(mockCvInstance);

      const response = await request(app)
        .post('/api/cvs/upload')
        .set('Authorization', 'Bearer validtoken') // Simulate authenticated user
        .attach('cv_pdf', Buffer.from('dummy pdf content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('CV uploaded and parsed successfully.');
      expect(response.body.cvId).toBe('cv-id-123');
      expect(response.body.extractedData).toEqual(mockParsedCvData);
      expect(MockedPdfParserService.parseCvPdf).toHaveBeenCalled();
      expect(MockedCv.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'mock-user-id',
        cv_data: mockParsedCvData,
      }));
    });

    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/cvs/upload')
        .set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No PDF file uploaded.');
    });
    
    // Note: Multer's file type validation happens before our controller.
    // Testing it directly here would require a more complex setup or testing multer middleware itself.
    // We rely on the multer config to reject non-PDFs.
    // However, we can test the error message if the service itself throws due to file type.

    it('should return 400 if PdfParserService fails to parse (e.g. bad format)', async () => {
        MockedPdfParserService.parseCvPdf.mockRejectedValue(new Error('Invalid PDF structure'));
  
        const response = await request(app)
          .post('/api/cvs/upload')
          .set('Authorization', 'Bearer validtoken')
          .attach('cv_pdf', Buffer.from('corrupted pdf content'), 'bad.pdf');
  
        expect(response.status).toBe(400); // As per PdfParserService error handling
        expect(response.body.message).toContain('Failed to parse PDF: Invalid PDF structure');
      });

    it('should return 500 if Cv.create fails (database error)', async () => {
      MockedPdfParserService.parseCvPdf.mockResolvedValue(mockParsedCvData);
      MockedCv.create.mockRejectedValue(new Error('Database connection lost'));

      const response = await request(app)
        .post('/api/cvs/upload')
        .set('Authorization', 'Bearer validtoken')
        .attach('cv_pdf', Buffer.from('dummy pdf content'), 'test.pdf');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Database error: Failed to save CV');
    });

    it('should return 401 if the user is not authenticated', async () => {
        // The mock for authMiddleware is set to return 401 directly if token is 'Bearer unauth'
        const response = await request(app)
          .post('/api/cvs/upload')
          .set('Authorization', 'Bearer unauth') // Trigger unauthenticated path in mock
          .attach('cv_pdf', Buffer.from('dummy pdf content'), 'test.pdf');
  
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized from mock');
      });
  });

  describe('PUT /api/cvs/:id', () => {
    const mockCvId = 'cv-test-id';
    const mockUserId = 'mock-user-id';
    const updateData = {
      cv_data: { personalInfo: { name: "Jane Doe Updated" }, summary: "Updated summary" },
      title: "My Updated CV Title",
    };

    let mockCvInstance: any;

    beforeEach(() => {
      mockCvInstance = {
        id: mockCvId,
        user_id: mockUserId,
        cv_data: { personalInfo: { name: "Jane Doe" }, summary: "Original summary" },
        title: "My CV Title",
        template_customization: null,
        save: jest.fn().mockResolvedValue(true), // Mock the save method
        toJSON: jest.fn().mockImplementation(() => ({ // Mock toJSON
            id: mockCvInstance.id,
            user_id: mockCvInstance.user_id,
            cv_data: mockCvInstance.cv_data,
            title: mockCvInstance.title,
            template_customization: mockCvInstance.template_customization,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })),
      };
    });

    it('should update a CV successfully', async () => {
      MockedCv.findOne.mockResolvedValue(mockCvInstance);
      // Update the mock instance data as the controller would
      mockCvInstance.save.mockImplementation(async function(this: any) {
        this.cv_data = updateData.cv_data;
        this.title = updateData.title;
        return this;
      });


      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer validtoken') // Authenticated user
        .send(updateData);

      expect(response.status).toBe(200);
      expect(MockedCv.findOne).toHaveBeenCalledWith({ where: { id: mockCvId, user_id: mockUserId } });
      expect(mockCvInstance.save).toHaveBeenCalled();
      expect(response.body.cv_data).toEqual(updateData.cv_data);
      expect(response.body.title).toEqual(updateData.title);
    });

    it('should return 404 if CV not found', async () => {
      MockedCv.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer validtoken')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('CV not found or access denied.');
    });

    it('should return 404 if CV belongs to another user (access denied)', async () => {
      // Mock findOne to return null as if user_id didn't match
      MockedCv.findOne.mockResolvedValue(null); 

      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer validtoken') // mockUserId is 'mock-user-id'
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('CV not found or access denied.');
    });

    it('should return 400 if cv_data is missing', async () => {
      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer validtoken')
        .send({ title: "Only a title" }); // Missing cv_data

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid input: cv_data is required and must be an object.');
    });
    
    it('should return 400 if cv_data is not an object', async () => {
        const response = await request(app)
          .put(`/api/cvs/${mockCvId}`)
          .set('Authorization', 'Bearer validtoken')
          .send({ cv_data: "not an object" }); 
  
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid input: cv_data is required and must be an object.');
      });

    it('should return 500 if cvInstance.save fails', async () => {
      MockedCv.findOne.mockResolvedValue(mockCvInstance);
      mockCvInstance.save.mockRejectedValue(new Error('Database update error'));

      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer validtoken')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error while updating CV.');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .put(`/api/cvs/${mockCvId}`)
        .set('Authorization', 'Bearer unauth') // Trigger unauthenticated path in mock
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized from mock');
    });
  });
});
