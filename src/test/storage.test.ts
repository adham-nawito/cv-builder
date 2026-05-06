import { describe, it, expect, beforeEach } from 'vitest';
import { saveCV, loadAllCVs, loadCV, deleteCV, setActiveCV, getActiveCV, checkStorageQuota } from '@/lib/storage';
import type { CVData } from '@/types/cv';

const makeCV = (id: string): CVData => ({
  id,
  name: `CV ${id}`,
  template: 'classic',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  sections: [],
});

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('checkStorageQuota returns true when localStorage is available', () => {
    expect(checkStorageQuota()).toBe(true);
  });

  it('loadAllCVs returns empty array when nothing saved', () => {
    expect(loadAllCVs()).toEqual([]);
  });

  it('saveCV persists and loadAllCVs returns it', () => {
    const cv = makeCV('cv-1');
    saveCV(cv);
    const all = loadAllCVs();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('cv-1');
  });

  it('saveCV updates existing CV instead of duplicating', () => {
    const cv = makeCV('cv-1');
    saveCV(cv);
    saveCV({ ...cv, name: 'Updated Name' });
    const all = loadAllCVs();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Updated Name');
  });

  it('loadCV returns the correct CV by id', () => {
    saveCV(makeCV('cv-a'));
    saveCV(makeCV('cv-b'));
    const result = loadCV('cv-b');
    expect(result?.id).toBe('cv-b');
  });

  it('loadCV returns null for unknown id', () => {
    expect(loadCV('nonexistent')).toBeNull();
  });

  it('deleteCV removes the CV', () => {
    saveCV(makeCV('cv-1'));
    saveCV(makeCV('cv-2'));
    deleteCV('cv-1');
    const all = loadAllCVs();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('cv-2');
  });

  it('setActiveCV and getActiveCV round-trip', () => {
    setActiveCV('cv-42');
    expect(getActiveCV()).toBe('cv-42');
  });

  it('getActiveCV returns null when not set', () => {
    expect(getActiveCV()).toBeNull();
  });
});
