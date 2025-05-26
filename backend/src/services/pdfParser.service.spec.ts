import PdfParserService from './pdfParser.service';
import pdfParse from 'pdf-parse';

// Mock pdf-parse
jest.mock('pdf-parse');

const mockPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>;

describe('PdfParserService', () => {
  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('parseCvPdf', () => {
    it('should correctly parse a well-structured CV text', async () => {
      const mockPdfBuffer = Buffer.from('dummy pdf content');
      const mockCvText = `
John Doe
Software Engineer

Summary
A highly skilled and motivated software engineer with 5 years of experience.

Experience
Senior Software Engineer
Tech Solutions Inc.
Jan 2020 - Present
- Developed and maintained web applications.

Software Engineer
Innovate Ltd.
Jun 2018 - Dec 2019
- Worked on various software projects.

Education
Master of Science in Computer Science
University of Technology
Aug 2016 - May 2018
- Specialized in AI.

Bachelor of Science in Computer Science
State University
Sep 2012 - Jun 2016

Skills
JavaScript, TypeScript, Node.js, React, Angular, Java, Python

Languages
English (Native)
Spanish (Fluent)
      `;
      mockPdfParse.mockResolvedValue({ text: mockCvText, numpages: 1, numrender: 1, info: {}, metadata: {}, version: '1.10.100' });

      const result = await PdfParserService.parseCvPdf(mockPdfBuffer);

      expect(mockPdfParse).toHaveBeenCalledWith(mockPdfBuffer);
      expect(result.personalInfo.name).toBe('John');
      expect(result.personalInfo.lastName).toBe('Doe');
      expect(result.personalInfo.title).toBe('Software Engineer');
      expect(result.summary).toContain('A highly skilled and motivated software engineer');
      expect(result.experience).toHaveLength(2);
      expect(result.experience[0].jobTitle).toBe('Senior Software Engineer');
      expect(result.experience[0].company).toBe('Tech Solutions Inc.');
      expect(result.experience[0].startDate).toBe('Jan 2020');
      expect(result.experience[0].endDate).toBe('Present');
      expect(result.experience[1].jobTitle).toBe('Software Engineer');
      expect(result.education).toHaveLength(2);
      expect(result.education[0].degree).toBe('Master of Science in Computer Science');
      expect(result.education[0].institution).toBe('University of Technology');
      expect(result.education[0].startDate).toBe('Aug 2016');
      expect(result.education[0].endDate).toBe('May 2018');
      expect(result.skills).toEqual(['JavaScript', 'TypeScript', 'Node.js', 'React', 'Angular', 'Java', 'Python']);
      expect(result.languages).toEqual([
        { language: 'English', level: 'Native' },
        { language: 'Spanish', level: 'Fluent' },
      ]);
    });

    it('should handle partially missing data', async () => {
      const mockPdfBuffer = Buffer.from('dummy pdf content');
      const mockCvText = `
Jane Smith
Product Manager

Experience
Product Lead
Another Corp
2021 - 2023

Skills
Product Management, Agile, Scrum
      `;
      mockPdfParse.mockResolvedValue({ text: mockCvText, numpages: 1, numrender: 1, info: {}, metadata: {}, version: '1.10.100' });

      const result = await PdfParserService.parseCvPdf(mockPdfBuffer);

      expect(result.personalInfo.name).toBe('Jane');
      expect(result.personalInfo.lastName).toBe('Smith');
      expect(result.personalInfo.title).toBe('Product Manager');
      expect(result.summary).toBeUndefined(); // Or empty string, depending on implementation
      expect(result.experience).toHaveLength(1);
      expect(result.experience[0].jobTitle).toBe('Product Lead');
      expect(result.experience[0].company).toBe('Another Corp');
      expect(result.experience[0].startDate).toBe('2021');
      expect(result.experience[0].endDate).toBe('2023');
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual(['Product Management', 'Agile', 'Scrum']);
      expect(result.languages).toEqual([]);
    });

    it('should handle unrecognized structure returning minimal data', async () => {
      const mockPdfBuffer = Buffer.from('dummy pdf content');
      const mockCvText = `
This is just a random text document.
No CV structure here.
      `;
      mockPdfParse.mockResolvedValue({ text: mockCvText, numpages: 1, numrender: 1, info: {}, metadata: {}, version: '1.10.100' });

      const result = await PdfParserService.parseCvPdf(mockPdfBuffer);
      // Based on current implementation, name might be picked up if capitalized words are at the start.
      // If the first line is "This is just a random text document."
      // name might be "This is just a random text", lastName "document."
      // This test might need adjustment based on how robust the name/title parsing is.
      // For now, let's assume it doesn't find much.
      expect(result.personalInfo.name).toBeUndefined(); // Or based on actual behavior for non-CV text
      expect(result.summary).toBeUndefined();
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.languages).toEqual([]);
    });

    it('should gracefully handle an error from pdf-parse', async () => {
      const mockPdfBuffer = Buffer.from('dummy pdf content');
      const errorMessage = 'PDF parsing failed miserably';
      mockPdfParse.mockRejectedValue(new Error(errorMessage));

      await expect(PdfParserService.parseCvPdf(mockPdfBuffer)).rejects.toThrow('Failed to parse PDF content.');
    });

    it('should correctly parse various date formats', async () => {
        const mockPdfBuffer = Buffer.from('dummy pdf content');
        const mockCvText = `
Experience
Lead Developer
Old Company
Sep. 2015 - August 2019

Developer
Startup LLC
2020 - Current
        `;
        mockPdfParse.mockResolvedValue({ text: mockCvText, numpages: 1, numrender: 1, info: {}, metadata: {}, version: '1.10.100' });
  
        const result = await PdfParserService.parseCvPdf(mockPdfBuffer);
  
        expect(result.experience).toHaveLength(2);
        expect(result.experience[0].jobTitle).toBe('Lead Developer');
        expect(result.experience[0].company).toBe('Old Company');
        expect(result.experience[0].startDate).toBe('Sep. 2015');
        expect(result.experience[0].endDate).toBe('August 2019');
        expect(result.experience[1].startDate).toBe('2020');
        expect(result.experience[1].endDate).toBe('Current');
      });

      it('should extract multiple experience and education entries', async () => {
        const mockPdfBuffer = Buffer.from('dummy pdf content');
        const mockCvText = \`
Experience
Job A
Company A
2022 - Present

Job B
Company B
2020 - 2021

Job C
Company C
2018 - 2019

Education
Degree X
University X
2016 - 2018

Degree Y
University Y
2012 - 2016
        \`;
        mockPdfParse.mockResolvedValue({ text: mockCvText, numpages: 1, numrender: 1, info: {}, metadata: {}, version: '1.10.100' });
        const result = await PdfParserService.parseCvPdf(mockPdfBuffer);
        expect(result.experience).toHaveLength(3);
        expect(result.experience[0].jobTitle).toBe('Job A');
        expect(result.experience[1].jobTitle).toBe('Job B');
        expect(result.experience[2].jobTitle).toBe('Job C');
        expect(result.education).toHaveLength(2);
        expect(result.education[0].degree).toBe('Degree X');
        expect(result.education[1].degree).toBe('Degree Y');
      });
  });
});
