import { describe, it, expect } from 'vitest';
import { generateHTML } from '@/utils/generateHTML';
import type { CVData } from '@/types/cv';

const baseCV: CVData = {
  id: 'html-1',
  name: 'HTML Test CV',
  template: 'classic',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  sections: [],
};

describe('generateHTML', () => {
  it('returns a valid HTML document for an empty CV', () => {
    const html = generateHTML(baseCV);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
  });

  it('escapes HTML special characters in content', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'personal-info', title: 'Personal Info',
        content: { fullName: 'John <Doe> & "Co"', jobTitle: 'Engineer', email: 'j@x.com', phone: '', location: '', linkedin: '' },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('John &lt;Doe&gt; &amp; &quot;Co&quot;');
    expect(html).not.toContain('John <Doe>');
  });

  it('renders personal-info as <header> with h1', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'personal-info', title: 'Personal Info',
        content: { fullName: 'Jane Doe', jobTitle: 'Engineer', email: 'jane@x.com', phone: '555-0000', location: 'NYC', linkedin: 'linkedin.com/in/jane', website: 'jane.dev' },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<header>');
    expect(html).toContain('<h1>Jane Doe</h1>');
    expect(html).toContain('jane@x.com');
    expect(html).toContain('555-0000');
    expect(html).toContain('NYC');
    expect(html).toContain('linkedin.com/in/jane');
    expect(html).toContain('jane.dev');
  });

  it('uses fullName in the <title> tag', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'personal-info', title: 'Personal Info',
        content: { fullName: 'Alice Smith', jobTitle: 'Designer', email: 'a@x.com', phone: '', location: '', linkedin: '' },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<title>Alice Smith - CV</title>');
  });

  it('renders summary section with h2 and paragraph', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'summary', title: 'Professional Summary',
        content: { text: 'Experienced engineer with 10 years of experience.' },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<h2>Professional Summary</h2>');
    expect(html).toContain('<p>Experienced engineer with 10 years of experience.</p>');
  });

  it('renders experience items with role, company, dates and bullets', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'experience', title: 'Experience',
        content: {
          items: [{
            id: 'e1', role: 'Senior Dev', company: 'Acme', startDate: '2020', endDate: 'Present',
            bullets: ['Led team of 5', 'Reduced latency by 40%'],
          }],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<h2>Experience</h2>');
    expect(html).toContain('<h3>Senior Dev — Acme</h3>');
    expect(html).toContain('2020');
    expect(html).toContain('Present');
    expect(html).toContain('<li>Led team of 5</li>');
    expect(html).toContain('<li>Reduced latency by 40%</li>');
  });

  it('renders education with degree, institution, dates', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'education', title: 'Education',
        content: {
          items: [{ id: 'edu1', degree: 'B.Sc. CS', institution: 'MIT', startDate: '2015', endDate: '2019', details: 'GPA: 4.0' }],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<h3>B.Sc. CS — MIT</h3>');
    expect(html).toContain('GPA: 4.0');
  });

  it('renders skills categories as strong label + comma-joined skills', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'skills', title: 'Skills',
        content: {
          categories: [
            { id: 'c1', name: 'Languages', skills: ['TypeScript', 'Python'] },
          ],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<strong>Languages:</strong>');
    expect(html).toContain('TypeScript, Python');
  });

  it('renders projects with name, description, and technologies', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'projects', title: 'Projects',
        content: {
          items: [{ id: 'p1', name: 'CVForge', description: 'A CV builder', technologies: 'React, TypeScript', link: '' }],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<h3>CVForge</h3>');
    expect(html).toContain('A CV builder');
    expect(html).toContain('<em>React, TypeScript</em>');
  });

  it('renders certifications as list items', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'certifications', title: 'Certifications',
        content: {
          items: [{ id: 'cert1', name: 'AWS SAA', issuer: 'Amazon', date: '2023' }],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<li>AWS SAA — Amazon (2023)</li>');
  });

  it('renders spoken languages as list items', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'languages', title: 'Languages',
        content: {
          items: [
            { id: 'l1', language: 'English', proficiency: 'Native' },
            { id: 'l2', language: 'Arabic', proficiency: 'Professional' },
          ],
        },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('<li>English — Native</li>');
    expect(html).toContain('<li>Arabic — Professional</li>');
  });

  it('renders spacer as div with height style', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'spacer', title: 'Spacer',
        content: { height: 24 },
      }],
    };
    const html = generateHTML(cv);
    expect(html).toContain('height: 24px');
  });

  it('omits linkedin/website line when both are empty', () => {
    const cv: CVData = {
      ...baseCV,
      sections: [{
        id: 's1', type: 'personal-info', title: 'Personal Info',
        content: { fullName: 'Bob', jobTitle: 'Dev', email: 'b@x.com', phone: '', location: '', linkedin: '', website: '' },
      }],
    };
    const html = generateHTML(cv);
    // linkedin line should not appear (no <p> after contact line)
    const headerMatch = html.match(/<header>([\s\S]*?)<\/header>/);
    expect(headerMatch?.[1]).not.toContain('undefined');
  });
});
