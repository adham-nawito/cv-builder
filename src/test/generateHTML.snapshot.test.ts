import { describe, it, expect } from 'vitest';
import { generateHTML } from '@/utils/generateHTML';
import type { CVData, TemplateType } from '@/types/cv';

// A rich CV fixture covering all section types
const fixtureCV: CVData = {
  id: 'snap-1',
  name: 'Snapshot CV',
  template: 'classic',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  sections: [
    {
      id: 's1', type: 'personal-info', title: 'Personal Info',
      content: { fullName: 'Jane Doe', jobTitle: 'Senior Engineer', email: 'jane@example.com', phone: '+1-555-0000', location: 'New York, NY', linkedin: 'linkedin.com/in/janedoe', website: 'janedoe.dev' },
    },
    {
      id: 's2', type: 'summary', title: 'Professional Summary',
      content: { text: 'Results-driven engineer with 8+ years building scalable systems.' },
    },
    {
      id: 's3', type: 'experience', title: 'Experience',
      content: {
        items: [{
          id: 'e1', role: 'Senior Engineer', company: 'Acme Corp',
          startDate: 'Jan 2021', endDate: 'Present',
          bullets: ['Led team of 5', 'Reduced latency by 40%'],
        }],
      },
    },
    {
      id: 's4', type: 'education', title: 'Education',
      content: { items: [{ id: 'edu1', degree: 'B.Sc. Computer Science', institution: 'MIT', startDate: '2013', endDate: '2017', details: 'GPA: 3.9' }] },
    },
    {
      id: 's5', type: 'skills', title: 'Skills',
      content: { categories: [{ id: 'c1', name: 'Languages', skills: ['TypeScript', 'Python'] }] },
    },
    {
      id: 's6', type: 'projects', title: 'Projects',
      content: { items: [{ id: 'p1', name: 'CVForge', description: 'A CV builder app', technologies: 'React, TypeScript', link: '' }] },
    },
    {
      id: 's7', type: 'certifications', title: 'Certifications',
      content: { items: [{ id: 'cert1', name: 'AWS SAA', issuer: 'Amazon', date: '2023' }] },
    },
    {
      id: 's8', type: 'languages', title: 'Languages',
      content: { items: [{ id: 'l1', language: 'English', proficiency: 'Native' }, { id: 'l2', language: 'Arabic', proficiency: 'Professional' }] },
    },
  ],
};

const TEMPLATES: TemplateType[] = ['classic', 'modern', 'minimal', 'executive', 'creative'];

describe('generateHTML snapshots', () => {
  // The HTML generator produces identical output regardless of template
  // (template styling is applied only in the React canvas, not in the exported HTML).
  // These snapshots lock down the HTML structure so regressions are caught immediately.

  it('generates stable HTML for the classic template fixture', () => {
    const html = generateHTML({ ...fixtureCV, template: 'classic' });
    expect(html).toMatchSnapshot();
  });

  it('generates stable HTML for all section types present', () => {
    const html = generateHTML(fixtureCV);
    // Structural assertions as a readable complement to the raw snapshot
    expect(html).toContain('<h1>Jane Doe</h1>');
    expect(html).toContain('<h2>Professional Summary</h2>');
    expect(html).toContain('<h2>Experience</h2>');
    expect(html).toContain('<h2>Education</h2>');
    expect(html).toContain('<h2>Skills</h2>');
    expect(html).toContain('<h2>Projects</h2>');
    expect(html).toContain('<h2>Certifications</h2>');
    expect(html).toContain('<h2>Languages</h2>');
  });

  // One snapshot per template — currently identical output (template is a render-time concern)
  // but this catches accidental divergence if template-specific HTML is added later
  for (const template of TEMPLATES) {
    it(`snapshot is stable for template: ${template}`, () => {
      const html = generateHTML({ ...fixtureCV, template });
      expect(html).toMatchSnapshot();
    });
  }

  it('snapshot of empty CV is stable', () => {
    const emptyCV: CVData = {
      id: 'snap-empty',
      name: 'Empty',
      template: 'classic',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      sections: [],
    };
    const html = generateHTML(emptyCV);
    expect(html).toMatchSnapshot();
  });
});
