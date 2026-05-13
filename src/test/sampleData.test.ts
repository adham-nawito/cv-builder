import { describe, it, expect } from 'vitest';
import { createSampleCV } from '@/utils/sampleData';
import { calculateATSScore } from '@/utils/atsScore';

describe('createSampleCV', () => {
  it('returns a CV with a unique id', () => {
    const a = createSampleCV();
    const b = createSampleCV();
    expect(a.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('includes all required core sections', () => {
    const cv = createSampleCV();
    const types = cv.sections.map(s => s.type);
    expect(types).toContain('personal-info');
    expect(types).toContain('summary');
    expect(types).toContain('experience');
    expect(types).toContain('education');
    expect(types).toContain('skills');
    expect(types).toContain('languages');
  });

  it('every section has a non-empty id and title', () => {
    const cv = createSampleCV();
    cv.sections.forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
    });
  });

  it('section ids are all unique', () => {
    const cv = createSampleCV();
    const ids = cv.sections.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('personal-info has a valid email', () => {
    const cv = createSampleCV();
    const pi = cv.sections.find(s => s.type === 'personal-info');
    const content = pi?.content as { email: string };
    expect(content.email).toContain('@');
  });

  it('experience items all have start and end dates', () => {
    const cv = createSampleCV();
    const exp = cv.sections.find(s => s.type === 'experience');
    const content = exp?.content as { items: { startDate: string; endDate: string }[] };
    content.items.forEach(item => {
      expect(item.startDate).toBeTruthy();
      expect(item.endDate).toBeTruthy();
    });
  });

  it('skills section has at least 2 categories', () => {
    const cv = createSampleCV();
    const skills = cv.sections.find(s => s.type === 'skills');
    const content = skills?.content as { categories: unknown[] };
    expect(content.categories.length).toBeGreaterThanOrEqual(2);
  });

  it('languages section has at least one item with language and proficiency', () => {
    const cv = createSampleCV();
    const langs = cv.sections.find(s => s.type === 'languages');
    const content = langs?.content as { items: { language: string; proficiency: string }[] };
    expect(content.items.length).toBeGreaterThanOrEqual(1);
    content.items.forEach(item => {
      expect(item.language).toBeTruthy();
      expect(item.proficiency).toBeTruthy();
    });
  });

  it('scores a B or above on ATS out of the box', () => {
    const cv = createSampleCV();
    const result = calculateATSScore(cv);
    expect(result.percentage).toBeGreaterThanOrEqual(70);
    expect(['A+', 'A', 'B']).toContain(result.grade);
  });

  it('has template set to classic', () => {
    const cv = createSampleCV();
    expect(cv.template).toBe('classic');
  });
});
