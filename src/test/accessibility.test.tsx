import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CVProvider } from '@/contexts/CVContext';
import { I18nProvider } from '@/lib/I18nContext';
import { CVSectionComponent } from '@/components/cv/CVSectionComponent';
import type { CVSection } from '@/types/cv';

expect.extend(toHaveNoViolations);

function renderSection(section: CVSection) {
  const { container } = render(
    <I18nProvider>
      <CVProvider>
        <CVSectionComponent section={section} isPreview />
      </CVProvider>
    </I18nProvider>,
  );
  return container;
}

describe('a11y — section renderers (preview mode)', () => {
  it('PersonalInfoRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'pi1', type: 'personal-info', title: 'Personal Info',
      content: { fullName: 'Jane Doe', jobTitle: 'Engineer', email: 'jane@x.com', phone: '555-0000', location: 'NYC', linkedin: '' },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SummaryRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'sm1', type: 'summary', title: 'Professional Summary',
      content: { text: 'Experienced software engineer with 10 years of experience.' },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ExperienceRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'exp1', type: 'experience', title: 'Experience',
      content: {
        items: [{
          id: 'e1', role: 'Senior Engineer', company: 'Acme',
          startDate: '2020', endDate: 'Present',
          bullets: ['Led team of 5', 'Reduced latency by 40%'],
        }],
      },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('EducationRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'edu1', type: 'education', title: 'Education',
      content: {
        items: [{ id: 'e1', degree: 'B.Sc. CS', institution: 'MIT', startDate: '2015', endDate: '2019' }],
      },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SkillsRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'sk1', type: 'skills', title: 'Skills',
      content: { categories: [{ id: 'c1', name: 'Languages', skills: ['TypeScript', 'Python'] }] },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProjectsRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'pr1', type: 'projects', title: 'Projects',
      content: { items: [{ id: 'p1', name: 'CVForge', description: 'A CV builder', technologies: 'React', link: '' }] },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CertificationsRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'cert1', type: 'certifications', title: 'Certifications',
      content: { items: [{ id: 'c1', name: 'AWS SAA', issuer: 'Amazon', date: '2023' }] },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LanguagesRenderer has no axe violations', async () => {
    const section: CVSection = {
      id: 'lang1', type: 'languages', title: 'Languages',
      content: { items: [{ id: 'l1', language: 'English', proficiency: 'Native' }] },
    };
    const container = renderSection(section);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
