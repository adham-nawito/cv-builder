import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CVProvider } from '@/contexts/CVContext';
import { CVSectionComponent } from '@/components/cv/CVSectionComponent';
import type { CVSection } from '@/types/cv';

function renderSection(section: CVSection) {
  return render(
    <CVProvider>
      <CVSectionComponent section={section} isPreview />
    </CVProvider>,
  );
}

// ---------------------------------------------------------------------------
// PersonalInfo
// ---------------------------------------------------------------------------
describe('PersonalInfoRenderer (preview)', () => {
  const section: CVSection = {
    id: 'pi1',
    type: 'personal-info',
    title: 'Personal Info',
    content: { fullName: 'Jane Doe', jobTitle: 'Engineer', email: 'jane@x.com', phone: '555-1234', location: 'NYC', linkedin: 'linkedin.com/in/jane' },
  };

  it('renders the full name', () => {
    renderSection(section);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
  });

  it('renders the job title', () => {
    renderSection(section);
    expect(screen.getByText('Engineer')).toBeTruthy();
  });

  it('renders contact info', () => {
    renderSection(section);
    expect(screen.getByText(/jane@x\.com/)).toBeTruthy();
    expect(screen.getByText(/555-1234/)).toBeTruthy();
    expect(screen.getByText(/NYC/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
describe('SummaryRenderer (preview)', () => {
  const section: CVSection = {
    id: 'sm1',
    type: 'summary',
    title: 'Professional Summary',
    content: { text: 'Experienced developer with 10 years in the industry.' },
  };

  it('renders the section title', () => {
    renderSection(section);
    expect(screen.getByText('Professional Summary')).toBeTruthy();
  });

  it('renders the summary text', () => {
    renderSection(section);
    expect(screen.getByText('Experienced developer with 10 years in the industry.')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------
describe('ExperienceRenderer (preview)', () => {
  const section: CVSection = {
    id: 'exp1',
    type: 'experience',
    title: 'Experience',
    content: {
      items: [{
        id: 'e1', role: 'Senior Engineer', company: 'Acme Corp',
        startDate: '2020', endDate: 'Present',
        bullets: ['Led team of 5', 'Improved performance by 40%'],
      }],
    },
  };

  it('renders role and company', () => {
    renderSection(section);
    expect(screen.getByText(/Senior Engineer/)).toBeTruthy();
    expect(screen.getByText(/Acme Corp/)).toBeTruthy();
  });

  it('renders all bullet points', () => {
    renderSection(section);
    expect(screen.getByText('Led team of 5')).toBeTruthy();
    expect(screen.getByText('Improved performance by 40%')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------
describe('EducationRenderer (preview)', () => {
  const section: CVSection = {
    id: 'edu1',
    type: 'education',
    title: 'Education',
    content: {
      items: [{ id: 'e1', degree: 'B.Sc. Computer Science', institution: 'MIT', startDate: '2015', endDate: '2019', details: 'GPA: 4.0' }],
    },
  };

  it('renders degree and institution', () => {
    renderSection(section);
    expect(screen.getByText(/B\.Sc\. Computer Science/)).toBeTruthy();
    expect(screen.getByText(/MIT/)).toBeTruthy();
  });

  it('renders details when present', () => {
    renderSection(section);
    expect(screen.getByText('GPA: 4.0')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
describe('SkillsRenderer (preview)', () => {
  const section: CVSection = {
    id: 'sk1',
    type: 'skills',
    title: 'Skills',
    content: {
      categories: [
        { id: 'c1', name: 'Languages', skills: ['TypeScript', 'Python'] },
        { id: 'c2', name: 'Tools', skills: ['Docker', 'AWS'] },
      ],
    },
  };

  it('renders each category name', () => {
    renderSection(section);
    expect(screen.getByText(/Languages/)).toBeTruthy();
    expect(screen.getByText(/Tools/)).toBeTruthy();
  });

  it('renders skills within each category', () => {
    renderSection(section);
    expect(screen.getByText(/TypeScript/)).toBeTruthy();
    expect(screen.getByText(/Docker/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
describe('ProjectsRenderer (preview)', () => {
  const section: CVSection = {
    id: 'pr1',
    type: 'projects',
    title: 'Projects',
    content: {
      items: [{ id: 'p1', name: 'CVForge', description: 'A CV builder app', technologies: 'React, TypeScript', link: '' }],
    },
  };

  it('renders project name', () => {
    renderSection(section);
    expect(screen.getByText('CVForge')).toBeTruthy();
  });

  it('renders description and technologies', () => {
    renderSection(section);
    expect(screen.getByText('A CV builder app')).toBeTruthy();
    expect(screen.getByText('React, TypeScript')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------
describe('CertificationsRenderer (preview)', () => {
  const section: CVSection = {
    id: 'cert1',
    type: 'certifications',
    title: 'Certifications',
    content: {
      items: [{ id: 'c1', name: 'AWS SAA', issuer: 'Amazon', date: '2023' }],
    },
  };

  it('renders certification name, issuer, and date', () => {
    renderSection(section);
    expect(screen.getByText(/AWS SAA/)).toBeTruthy();
    expect(screen.getByText(/Amazon/)).toBeTruthy();
    expect(screen.getByText(/2023/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------
describe('LanguagesRenderer (preview)', () => {
  const section: CVSection = {
    id: 'lang1',
    type: 'languages',
    title: 'Languages',
    content: {
      items: [
        { id: 'l1', language: 'English', proficiency: 'Native' },
        { id: 'l2', language: 'Arabic', proficiency: 'Professional' },
      ],
    },
  };

  it('renders each language', () => {
    renderSection(section);
    expect(screen.getByText(/English/)).toBeTruthy();
    expect(screen.getByText(/Arabic/)).toBeTruthy();
  });

  it('renders proficiency levels', () => {
    renderSection(section);
    expect(screen.getByText(/Native/)).toBeTruthy();
    expect(screen.getByText(/Professional/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Hidden section
// ---------------------------------------------------------------------------
describe('Hidden section', () => {
  it('renders nothing when hidden and isPreview is true', () => {
    const section: CVSection = {
      id: 'h1',
      type: 'summary',
      title: 'Summary',
      hidden: true,
      content: { text: 'This should not appear' },
    };
    const { container } = renderSection(section);
    expect(container.firstChild).toBeNull();
  });
});
