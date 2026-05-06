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

  it('maxScore is always 100', () => {
    const result = calculateATSScore(fullCV);
    expect(result.maxScore).toBe(100);
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
});
