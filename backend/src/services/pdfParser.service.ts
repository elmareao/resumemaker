import pdfParse from 'pdf-parse';

// Define the structure for the parsed CV data
interface CvData {
  personalInfo: {
    name?: string;
    lastName?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string;
    address?: string;
  };
  summary?: string;
  experience: Array<{
    jobTitle?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: string[];
  languages: Array<{
    language?: string;
    level?: string;
  }>;
  customSections: Array<{
    title?: string;
    content?: string;
  }>;
}

class PdfParserService {
  public async parseCvPdf(pdfBuffer: Buffer): Promise<CvData> {
    try {
      const data = await pdfParse(pdfBuffer);
      const rawText = data.text;

      // Initialize CV data structure with default empty values
      const cvData: CvData = {
        personalInfo: {},
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        customSections: [],
      };

      // TODO: Implement heuristics to extract information from rawText
      // This will be the most complex part and will involve regex and string manipulation

      cvData.personalInfo = this.extractPersonalInfo(rawText);
      cvData.summary = this.extractSummary(rawText);
      cvData.experience = this.extractExperience(rawText);
      cvData.education = this.extractEducation(rawText);
      cvData.skills = this.extractSkills(rawText);
      cvData.languages = this.extractLanguages(rawText);
      // Custom sections might be harder to generically parse and might be empty
      // cvData.customSections = this.extractCustomSections(rawText);


      console.log('Successfully parsed PDF text.');
      // console.log('Raw text for debugging:', rawText.substring(0, 1000));


      return cvData;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF content.');
    }
  }

  private extractPersonalInfo(text: string): CvData['personalInfo'] {
    const personalInfo: CvData['personalInfo'] = {};
    const lines = text.split('\n');

    // Name: LinkedIn often puts the name on the first or second line.
    // This is a very basic assumption and might need refinement.
    if (lines.length > 0) {
        const nameParts = lines[0].trim().split(/\s+/);
        if (nameParts.length >= 2 && nameParts[0][0] === nameParts[0][0].toUpperCase() && nameParts[1][0] === nameParts[1][0].toUpperCase()) {
            personalInfo.name = nameParts.slice(0, -1).join(' '); // First N-1 parts as name
            personalInfo.lastName = nameParts.slice(-1).join(' '); // Last part as lastname
        }
    }
    
    // Title: Often follows the name or is on the next line.
    // This is also a basic assumption.
    if (lines.length > 1 && !personalInfo.name) { // If name wasn't on line 0, try line 1
        const nameParts = lines[1].trim().split(/\s+/);
         if (nameParts.length >= 2 && nameParts[0][0] === nameParts[0][0].toUpperCase() && nameParts[1][0] === nameParts[1][0].toUpperCase()) {
            personalInfo.name = nameParts.slice(0, -1).join(' ');
            personalInfo.lastName = nameParts.slice(-1).join(' ');
        }
    }
    // A simple heuristic for title: check line 2 or 3 if name was found
    if (personalInfo.name && lines.length > (lines[0].trim().split(/\s+/).length >=2 ? 1:2) ) {
        const potentialTitleLine = lines[lines[0].trim().split(/\s+/).length >=2 ? 1:2].trim();
        // Avoid matching common section headers like "Summary" or "Experience" as a title
        if (potentialTitleLine.length > 5 && potentialTitleLine.length < 100 && !/^(Summary|Experience|Education|Skills|Projects|Contact)/i.test(potentialTitleLine)) {
             personalInfo.title = potentialTitleLine;
        }
    }


    personalInfo.email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)?.[0];
    personalInfo.phone = text.match(/(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[\s.-]?\d{3}[\s.-]?\d{4}/g)?.[0];
    personalInfo.linkedin = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9-]+)/gi)?.[0];
    personalInfo.website = text.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/gi)?.filter(url => !url.includes('linkedin.com'))?.[0]; // Simple regex, might need refinement
    
    // Address: LinkedIn sometimes includes a general location (e.g., "City, Country")
    // This is harder to reliably extract without specific keywords or formats.
    // For now, we'll leave it basic. Look for lines with city, state/country.
    const addressKeywords = ['Address', 'Location'];
    const addressRegex = new RegExp(`(?:${addressKeywords.join('|')})[:\\s]?(.+)`, 'i');
    let addressMatch = text.match(addressRegex);
    if (addressMatch) {
        personalInfo.address = addressMatch[1].trim();
    } else {
        // Try a more general approach: look for lines that seem like addresses (e.g., City, State/Country)
        // This is highly heuristic and might pick up wrong info.
        const potentialAddressLines = lines.filter(line => line.match(/([A-Za-z\s]+,\s[A-Za-z\s]+)/) && line.length < 100 && line.length > 5);
        if (potentialAddressLines.length > 0 && !personalInfo.email && !personalInfo.phone && !personalInfo.linkedin) { // try to avoid grabbing contact block as address
            // Find the address line that is most likely, e.g. often near the top or under a "Contact" type section.
            // For now, just take the first plausible one if no other contact info is on that line.
            const firstPotentialAddress = potentialAddressLines.find(line => 
                !/[@]|(linkedin\.com)|(\d{3}[\s.-]?\d{4})/i.test(line) // not email, linkedin, or phone
            );
            if (firstPotentialAddress) personalInfo.address = firstPotentialAddress.trim();
        }
    }


    return personalInfo;
  }

  private extractSummary(text: string): string | undefined {
    const summaryKeywords = ['Summary', 'About', 'Overview', 'Professional Profile'];
    // Regex to find a section starting with a keyword and capture the content until the next common section keyword or end of text
    const summaryRegex = new RegExp(`(?:${summaryKeywords.join('|')})\\n?([\\s\\S]+?)(?=\\n(?:Experience|Education|Skills|Projects|Contact|Publications|Languages|Honors|Awards)|$)`, 'i');
    const match = text.match(summaryRegex);
    return match?.[1].trim();
  }

  private extractExperience(text: string): CvData['experience'] {
    const experience: CvData['experience'] = [];
    const experienceKeywords = ['Experience', 'Work Experience', 'Professional Experience'];
    const sectionRegex = new RegExp(`(?:${experienceKeywords.join('|')})\\n?([\\s\\S]+?)(?=\\n(?:Education|Skills|Projects|Contact|Summary|Languages|Honors|Awards)|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);

    if (sectionMatch) {
      const sectionText = sectionMatch[1];
      // Regex to identify individual job entries. This is complex due to varying formats.
      // It looks for a potential job title (often capitalized words), then company, then dates.
      // This will need significant refinement and testing.
      const entries = sectionText.split(/\n(?=[A-Z][a-z]+\s?[A-Z]?[a-z]*\s?-?\s?[A-Z][a-z]+)/); // Split by lines starting with likely job titles

      entries.forEach(entryText => {
        if (entryText.trim().length < 10) return; // Skip very short entries

        const job: CvData['experience'][0] = {};
        const lines = entryText.trim().split('\n');
        
        job.jobTitle = lines[0]?.trim(); // First line as job title (assumption)
        
        // Company: Often on the next line or identifiable by keywords like "at" or certain formatting.
        // This is a placeholder, real extraction is more complex.
        if (lines.length > 1) {
            job.company = lines[1]?.trim(); 
        }

        // Dates: Look for common date patterns (e.g., "Mar 2020 - Present", "2018 - 2022")
        const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s\d{4}\b|\b\d{4}\b)\s*-\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s\d{4}\b|\b\d{4}\b|Present|Current)/gi;
        const dateMatch = entryText.match(dateRegex);
        if (dateMatch) {
          const dates = dateMatch[0].split(/\s*-\s*/);
          job.startDate = dates[0]?.trim();
          job.endDate = dates[1]?.trim();
        }

        // Description: The remaining text after title, company, and dates.
        // This needs to be carefully implemented to avoid grabbing parts of the next entry.
        let descriptionStartIndex = 1; // Start after title
        if (job.company) descriptionStartIndex++;
        if (job.startDate) { // if dates were found, try to remove them from description
            let dateLineIndex = lines.findIndex(line => dateRegex.test(line));
            if (dateLineIndex !== -1) descriptionStartIndex = Math.max(descriptionStartIndex, dateLineIndex + 1);
        }
        job.description = lines.slice(descriptionStartIndex).join('\n').trim();
        
        if (job.jobTitle && job.company) { // Basic validation
             experience.push(job);
        }
      });
    }
    return experience;
  }

  private extractEducation(text: string): CvData['education'] {
    const education: CvData['education'] = [];
    const educationKeywords = ['Education', 'Academic Background', 'Qualifications'];
    const sectionRegex = new RegExp(`(?:${educationKeywords.join('|')})\\n?([\\s\\S]+?)(?=\\n(?:Experience|Skills|Projects|Contact|Summary|Languages|Honors|Awards)|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);

    if (sectionMatch) {
      const sectionText = sectionMatch[1];
      // Simplified entry splitting, assuming each institution or degree starts a new entry.
      // This will need refinement.
      const entries = sectionText.split(/\n(?=[A-Z][A-Za-z\s]+[A-Z][A-Za-z]+)/); // Split by lines starting with likely institution names or degrees

      entries.forEach(entryText => {
        if (entryText.trim().length < 5) return;

        const edu: CvData['education'][0] = {};
        const lines = entryText.trim().split('\n');

        edu.institution = lines[0]?.trim(); // First line as institution (assumption)

        // Degree: Often on the next line or after the institution.
        if (lines.length > 1) {
            // Check if the second line looks like a degree (e.g., Bachelor of Science, Master's)
            // or if the first line was the degree and second is institution
            if (/(Bachelor|Master|PhD|Associate|Diploma|Certificate)/i.test(lines[1])) {
                 edu.degree = lines[1]?.trim();
            } else if (lines.length > 2 && /(Bachelor|Master|PhD|Associate|Diploma|Certificate)/i.test(lines[0])) {
                // Maybe institution was after degree
                edu.degree = lines[0]?.trim();
                edu.institution = lines[1]?.trim();
            }
        }
        
        const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s\d{4}\b|\b\d{4}\b)\s*-\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s\d{4}\b|\b\d{4}\b|Present|Current)/gi;
        const dateMatch = entryText.match(dateRegex);
        if (dateMatch) {
          const dates = dateMatch[0].split(/\s*-\s*/);
          edu.startDate = dates[0]?.trim();
          edu.endDate = dates[1]?.trim();
        }
        
        let descriptionStartIndex = 1;
        if (edu.degree) descriptionStartIndex++;
         if (edu.startDate) { 
            let dateLineIndex = lines.findIndex(line => dateRegex.test(line));
            if (dateLineIndex !== -1) descriptionStartIndex = Math.max(descriptionStartIndex, dateLineIndex + 1);
        }
        edu.description = lines.slice(descriptionStartIndex).join('\n').trim();
        
        if (edu.institution && edu.degree) { // Basic validation
            education.push(edu);
        }
      });
    }
    return education;
  }

  private extractSkills(text: string): string[] {
    const skillsKeywords = ['Skills', 'Top Skills', 'Technical Skills', 'Expertise'];
    // Regex to find a skills section and capture the content until the next section or end of text
    const skillsRegex = new RegExp(`(?:${skillsKeywords.join('|')})\\n?([\\s\\S]+?)(?=\\n(?:Experience|Education|Projects|Contact|Summary|Languages|Honors|Awards)|$)`, 'i');
    const match = text.match(skillsRegex);
    if (match && match[1]) {
      // Skills are often listed comma-separated, bullet-pointed, or on new lines.
      // This simple split might need to be more robust.
      return match[1].trim().split(/[\n,•●▪▫–-]\s*/).map(skill => skill.trim()).filter(skill => skill.length > 0 && skill.length < 50); // filter out empty and too long strings
    }
    return [];
  }

  private extractLanguages(text: string): CvData['languages'] {
    const languages: CvData['languages'] = [];
    const languagesKeywords = ['Languages', 'Language Proficiency'];
    const sectionRegex = new RegExp(`(?:${languagesKeywords.join('|')})\\n?([\\s\\S]+?)(?=\\n(?:Experience|Education|Skills|Projects|Contact|Summary|Honors|Awards)|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);

    if (sectionMatch && sectionMatch[1]) {
      const sectionText = sectionMatch[1].trim();
      // Languages might be listed as "Language (Proficiency)" or "Language - Proficiency"
      const entries = sectionText.split(/[\n•●▪▫–-]\s*/); // Split by newlines or common list markers
      entries.forEach(entry => {
        if (entry.trim().length < 2) return;
        // Try to match "Language (Proficiency)" or "Language - Proficiency"
        const langMatch = entry.match(/([a-zA-Z\s]+)(?:\s*[-–(]?\s*([a-zA-Z\s]+)\)?)/);
        if (langMatch && langMatch[1]) {
          languages.push({
            language: langMatch[1].trim(),
            level: langMatch[2]?.trim() || 'Not specified', // Default if proficiency is not found
          });
        } else if (entry.trim().length > 0 && entry.trim().length < 30) { // If no clear proficiency, assume it's just the language name
            languages.push({ language: entry.trim(), level: 'Not specified' });
        }
      });
    }
    return languages;
  }
  
  // Placeholder for custom sections - this is very difficult to do generically
  // private extractCustomSections(text: string): CvData['customSections'] {
  //   return [];
  // }
}

export default new PdfParserService();
