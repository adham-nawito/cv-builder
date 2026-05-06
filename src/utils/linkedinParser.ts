import { v4 as uuid } from 'uuid';
import type { CVData, CVSection } from '@/types/cv';

// LinkedIn PDF text is structured with section headers followed by content
// This parser handles common LinkedIn PDF export formats

interface ParsedLinkedIn {
  name: string;
  headline: string;
  location: string;
  email: string;
  summary: string;
  experience: { company: string; role: string; dates: string; description: string[] }[];
  education: { institution: string; degree: string; dates: string }[];
  skills: string[];
  certifications: { name: string; issuer: string; date: string }[];
  languages: { language: string; proficiency: string }[];
}

const SECTION_HEADERS = [
  'experience', 'education', 'skills', 'certifications', 'licenses & certifications',
  'languages', 'summary', 'about', 'honors & awards', 'projects', 'volunteer',
  'publications', 'courses', 'organizations', 'recommendations',
];

function isSectionHeader(line: string): string | null {
  const lower = line.trim().toLowerCase();
  for (const header of SECTION_HEADERS) {
    if (lower === header || lower === header + ':') return header;
  }
  return null;
}

function parseDateRange(text: string): { start: string; end: string } {
  // Match patterns like "Jan 2020 - Present", "2018 - 2021", "Mar 2019 – Dec 2020"
  const match = text.match(/(\w+\s*\d{4}|\d{4})\s*[-–]\s*(\w+\s*\d{4}|\d{4}|[Pp]resent|[Cc]urrent)/);
  if (match) return { start: match[1].trim(), end: match[2].trim() };
  const yearMatch = text.match(/(\d{4})/);
  if (yearMatch) return { start: yearMatch[1], end: '' };
  return { start: '', end: '' };
}

export async function parseLinkedInPDF(file: File): Promise<CVData> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  const parsed = parseLinkedInText(fullText);
  return buildCVFromLinkedIn(parsed);
}

function parseLinkedInText(text: string): ParsedLinkedIn {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const result: ParsedLinkedIn = {
    name: '',
    headline: '',
    location: '',
    email: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  };

  if (lines.length === 0) return result;

  // First non-empty line is usually the name
  result.name = lines[0] || '';

  // Second line is often the headline/title
  if (lines.length > 1 && !isSectionHeader(lines[1])) {
    result.headline = lines[1] || '';
  }

  // Find location (usually contains a city/country pattern)
  for (let i = 2; i < Math.min(lines.length, 8); i++) {
    if (/,\s*\w/.test(lines[i]) && lines[i].length < 80) {
      result.location = lines[i];
      break;
    }
  }

  // Find email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) result.email = emailMatch[0];

  // Parse sections
  let currentSection = '';
  let sectionLines: string[] = [];

  const processSectionLines = () => {
    if (!currentSection) return;

    if (currentSection === 'summary' || currentSection === 'about') {
      result.summary = sectionLines.join(' ');
    } else if (currentSection === 'experience') {
      parseExperienceLines(sectionLines, result);
    } else if (currentSection === 'education') {
      parseEducationLines(sectionLines, result);
    } else if (currentSection === 'skills') {
      result.skills = sectionLines
        .join(' ')
        .split(/[,·•|]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 50);
    } else if (currentSection === 'certifications' || currentSection === 'licenses & certifications') {
      parseCertificationLines(sectionLines, result);
    } else if (currentSection === 'languages') {
      sectionLines.forEach(line => {
        const parts = line.split(/[-–:]/);
        result.languages.push({
          language: parts[0]?.trim() || line,
          proficiency: parts[1]?.trim() || '',
        });
      });
    }
  };

  for (const line of lines) {
    const header = isSectionHeader(line);
    if (header) {
      processSectionLines();
      currentSection = header;
      sectionLines = [];
    } else if (currentSection) {
      sectionLines.push(line);
    }
  }
  processSectionLines();

  return result;
}

function parseExperienceLines(lines: string[], result: ParsedLinkedIn) {
  // Group by date ranges — heuristic approach
  let current: { company: string; role: string; dates: string; description: string[] } | null = null;

  for (const line of lines) {
    const dateRange = parseDateRange(line);
    if (dateRange.start) {
      if (current) result.experience.push(current);
      // Previous line might be role, one before company
      current = { company: '', role: '', dates: line, description: [] };
    } else if (current) {
      if (!current.role && line.length < 80) {
        current.role = line;
      } else if (!current.company && line.length < 80) {
        current.company = line;
      } else {
        current.description.push(line);
      }
    }
  }
  if (current) result.experience.push(current);

  // Try to fix role/company assignment
  result.experience.forEach(exp => {
    if (!exp.role && exp.company) {
      exp.role = exp.company;
      exp.company = '';
    }
  });
}

function parseEducationLines(lines: string[], result: ParsedLinkedIn) {
  let current: { institution: string; degree: string; dates: string } | null = null;

  for (const line of lines) {
    const dateRange = parseDateRange(line);
    if (dateRange.start || (!current && line.length < 80)) {
      if (current) result.education.push(current);
      current = { institution: line, degree: '', dates: dateRange.start ? `${dateRange.start} - ${dateRange.end}` : '' };
    } else if (current) {
      if (!current.degree) current.degree = line;
      else if (!current.dates && parseDateRange(line).start) {
        const d = parseDateRange(line);
        current.dates = `${d.start} - ${d.end}`;
      }
    }
  }
  if (current) result.education.push(current);
}

function parseCertificationLines(lines: string[], result: ParsedLinkedIn) {
  for (let i = 0; i < lines.length; i++) {
    result.certifications.push({
      name: lines[i],
      issuer: lines[i + 1] && !parseDateRange(lines[i + 1]).start ? lines[++i] : '',
      date: '',
    });
  }
}

function buildCVFromLinkedIn(parsed: ParsedLinkedIn): CVData {
  const sections: CVSection[] = [];

  // Personal info
  sections.push({
    id: uuid(),
    type: 'personal-info',
    title: 'Personal Info',
    content: {
      fullName: parsed.name,
      jobTitle: parsed.headline,
      email: parsed.email,
      phone: '',
      location: parsed.location,
      linkedin: '',
    },
  });

  // Summary
  if (parsed.summary) {
    sections.push({
      id: uuid(),
      type: 'summary',
      title: 'Professional Summary',
      content: { text: parsed.summary },
    });
  }

  // Experience
  if (parsed.experience.length > 0) {
    sections.push({
      id: uuid(),
      type: 'experience',
      title: 'Experience',
      content: {
        items: parsed.experience.map(exp => {
          const dates = parseDateRange(exp.dates);
          return {
            id: uuid(),
            company: exp.company || 'Company',
            role: exp.role || 'Role',
            startDate: dates.start,
            endDate: dates.end,
            bullets: exp.description.length > 0 ? exp.description : [''],
          };
        }),
      },
    });
  }

  // Education
  if (parsed.education.length > 0) {
    sections.push({
      id: uuid(),
      type: 'education',
      title: 'Education',
      content: {
        items: parsed.education.map(edu => ({
          id: uuid(),
          institution: edu.institution,
          degree: edu.degree,
          startDate: parseDateRange(edu.dates).start,
          endDate: parseDateRange(edu.dates).end,
        })),
      },
    });
  }

  // Skills
  if (parsed.skills.length > 0) {
    sections.push({
      id: uuid(),
      type: 'skills',
      title: 'Skills',
      content: {
        categories: [{ id: uuid(), name: 'Skills', skills: parsed.skills.slice(0, 20) }],
      },
    });
  }

  // Certifications
  if (parsed.certifications.length > 0) {
    sections.push({
      id: uuid(),
      type: 'certifications',
      title: 'Certifications',
      content: {
        items: parsed.certifications.map(c => ({
          id: uuid(),
          name: c.name,
          issuer: c.issuer,
          date: c.date,
        })),
      },
    });
  }

  // Languages
  if (parsed.languages.length > 0) {
    sections.push({
      id: uuid(),
      type: 'languages',
      title: 'Languages',
      content: {
        items: parsed.languages.map(l => ({
          id: uuid(),
          language: l.language,
          proficiency: l.proficiency,
        })),
      },
    });
  }

  return {
    id: uuid(),
    name: `${parsed.name}'s CV`,
    sections,
    template: 'classic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
