import { describe, it, expect } from 'vitest';
import { calculateATSScore } from '@/utils/atsScore';
import type { CVData } from '@/types/cv';

const minimalCV: CVData = {
  id: 'test-1',
  name: 'Test CV',
  template: 'classic',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  sections: [],
};

const fullCV: CVData = {
  id: 'test-2',
  name: 'Full CV',
  template: 'classic',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  sections: [
    {
      id: 's1',
      type: 'personal-info',
      title: 'Personal Info',
      content: {
        fullName: 'Jane Doe',
        jobTitle: 'Engineer',
        email: 'jane@example.com',
        phone: '+1234567890',
        location: 'New York',
        linkedin: 'linkedin.com/in/jane',
      },
    },
    {
      id: 's2',
      type: 'summary',
      title: 'Summary',
      content: {
        text: 'Experienced software engineer with 8+ years building scalable systems. Led teams of 10+ developers to deliver high-impact products on time and within budget.',
      },
    },
    {
      id: 's3',
      type: 'experience',
      title: 'Experience',
      content: {
        items: [
          {
            id: 'e1',
            company: 'Acme Corp',
            role: 'Senior Engineer',
            startDate: '2020-01',
            endDate: '2024-01',
            bullets: [
              'Led migration of monolith to microservices, reducing latency by 40%',
              'Built CI/CD pipeline serving 50+ engineers',
              'Managed team of 5 developers',
            ],
          },
          {
            id: 'e2',
            company: 'Beta Inc',
            role: 'Engineer',
            startDate: '2017-01',
            endDate: '2020-01',
            bullets: [
              'Developed RESTful APIs handling 1M+ requests/day',
              'Optimized database queries, improving response time by 60%',
              'Implemented automated testing increasing coverage to 85%',
            ],
          },
        ],
      },
    },
    {
      id: 's4',
      type: 'education',
      title: 'Education',
      content: {
        items: [
          {
            id: 'edu1',
            institution: 'MIT',
            degree: 'B.Sc. Computer Science',
            startDate: '2013',
            endDate: '2017',
          },
        ],
      },
    },
    {
      id: 's5',
      type: 'skills',
      title: 'Skills',
      content: {
        categories: [
          { id: 'c1', name: 'Languages', skills: ['TypeScript', 'Python', 'Go', 'Rust'] },
          { id: 'c2', name: 'Tools', skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'PostgreSQL'] },
        ],
      },
    },
  ],
};

describe('calculateATSScore', () => {
  it('returns very low score for empty CV', () => {
    const result = calculateATSScore(minimalCV);
    // classic template with no sections scores 10/100 (no-custom + classic-template structure bonus)
    expect(result.total).toBe(10);
    expect(result.percentage).toBe(10);
    expect(result.grade).toBe('F');
  });

  it('returns high score for well-filled CV', () => {
    const result = calculateATSScore(fullCV);
    expect(result.percentage).toBeGreaterThanOrEqual(70);
    expect(['A+', 'A', 'B']).toContain(result.grade);
  });

  it('maxScore is always 105', () => {
    const result = calculateATSScore(fullCV);
    expect(result.maxScore).toBe(105);
  });

  it('critical tips for empty CV include personal info and experience', () => {
    const result = calculateATSScore(minimalCV);
    const criticals = result.tips.filter(t => t.category === 'critical').map(t => t.message);
    expect(criticals.some(m => m.toLowerCase().includes('personal info'))).toBe(true);
    expect(criticals.some(m => m.toLowerCase().includes('experience'))).toBe(true);
  });

  it('breakdown categories sum to maxScore', () => {
    const result = calculateATSScore(fullCV);
    const total = result.breakdown.reduce((s, b) => s + b.max, 0);
    expect(total).toBe(result.maxScore);
  });

  it('grade thresholds are correct', () => {
    const score = calculateATSScore(fullCV);
    if (score.percentage >= 95) expect(score.grade).toBe('A+');
    else if (score.percentage >= 85) expect(score.grade).toBe('A');
    else if (score.percentage >= 70) expect(score.grade).toBe('B');
  });

  it('tips have no negative points', () => {
    const result = calculateATSScore(minimalCV);
    result.tips.forEach(t => expect(t.points).toBeGreaterThan(0));
  });

  it('all tip ids are unique', () => {
    const result = calculateATSScore(minimalCV);
    const ids = result.tips.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('percentage is between 0 and 100', () => {
    const empty = calculateATSScore(minimalCV);
    const full  = calculateATSScore(fullCV);
    expect(empty.percentage).toBeGreaterThanOrEqual(0);
    expect(empty.percentage).toBeLessThanOrEqual(100);
    expect(full.percentage).toBeGreaterThanOrEqual(0);
    expect(full.percentage).toBeLessThanOrEqual(100);
  });

  it('total never exceeds maxScore', () => {
    const result = calculateATSScore(fullCV);
    expect(result.total).toBeLessThanOrEqual(result.maxScore);
  });

  it('breakdown includes a Languages category with max 5', () => {
    const result = calculateATSScore(fullCV);
    const langBreakdown = result.breakdown.find(b => b.category === 'Languages');
    expect(langBreakdown).toBeDefined();
    expect(langBreakdown?.max).toBe(5);
  });

  it('suggests adding languages section when missing', () => {
    const result = calculateATSScore(minimalCV);
    const tip = result.tips.find(t => t.message.includes('Languages section'));
    expect(tip).toBeDefined();
    expect(tip?.category).toBe('suggestion');
  });

  it('scores full languages credit when section has items with proficiency', () => {
    const cvWithLangs: CVData = {
      ...minimalCV,
      id: 'test-langs',
      sections: [{
        id: 'l1',
        type: 'languages',
        title: 'Languages',
        content: { items: [{ id: 'li1', language: 'English', proficiency: 'Native' }] },
      }],
    };
    const result = calculateATSScore(cvWithLangs);
    const langBreakdown = result.breakdown.find(b => b.category === 'Languages');
    expect(langBreakdown?.score).toBe(5);
  });

  it('sectionIssues marks languages null when section is present and valid', () => {
    const cvWithLangs: CVData = {
      ...minimalCV,
      id: 'test-langs-issues',
      sections: [{
        id: 'l1',
        type: 'languages',
        title: 'Languages',
        content: { items: [{ id: 'li1', language: 'Arabic', proficiency: 'Native' }] },
      }],
    };
    const result = calculateATSScore(cvWithLangs);
    expect(result.sectionIssues['languages']).toBeNull();
  });

  it('sectionIssues for experience is null when experience section is absent', () => {
    const result = calculateATSScore(minimalCV);
    // section is missing so no canvas highlight, but the key is still set to null
    expect(result.sectionIssues['experience']).toBeNull();
  });

  it('sectionIssues marks personal-info null when fully filled', () => {
    const result = calculateATSScore(fullCV);
    expect(result.sectionIssues['personal-info']).toBeNull();
  });

  it('personal-info critical when email is missing', () => {
    const cv: CVData = {
      ...minimalCV,
      id: 'test-pi',
      sections: [{
        id: 'pi1',
        type: 'personal-info',
        title: 'Personal Info',
        content: { fullName: 'Jane Doe', jobTitle: 'Engineer', email: '', phone: '', location: '', linkedin: '' },
      }],
    };
    const result = calculateATSScore(cv);
    expect(result.sectionIssues['personal-info']).toBe('critical');
  });

  it('summary warning when text is too short', () => {
    const cv: CVData = {
      ...minimalCV,
      id: 'test-sum',
      sections: [{
        id: 'sm1',
        type: 'summary',
        title: 'Summary',
        content: { text: 'Short summary.' },
      }],
    };
    const result = calculateATSScore(cv);
    const tip = result.tips.find(t => t.message.includes('too short'));
    expect(tip).toBeDefined();
  });
});
