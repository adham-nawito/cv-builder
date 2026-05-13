import type { CVData } from '@/types/cv';
import { validateCVData } from '@/schemas/cv';
import { migrateSchema } from '@/utils/migrateSchema';
import { v4 as uuid } from 'uuid';

const LIST_KEY    = 'cvforge:cvs';
const SESSION_KEY = 'cvforge_current';

export function checkStorageQuota(): boolean {
  try {
    const test = '__quota_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function saveCV(cv: CVData): void {
  const all = loadAllCVs();
  const idx = all.findIndex((c) => c.id === cv.id);
  if (idx >= 0) all[idx] = cv;
  else all.push(cv);
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(all));
  } catch { /* quota exceeded */ }
}

export function loadAllCVs(): CVData[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item: unknown) => {
      const result = validateCVData(item);
      return result.success ? [migrateSchema(result.data as CVData)] : [];
    });
  } catch {
    return [];
  }
}

export function loadCV(id: string): CVData | null {
  return loadAllCVs().find((c) => c.id === id) ?? null;
}

export function deleteCV(id: string): void {
  const all = loadAllCVs().filter((c) => c.id !== id);
  localStorage.setItem(LIST_KEY, JSON.stringify(all));
}

export function duplicateCV(id: string): CVData | null {
  const original = loadCV(id);
  if (!original) return null;
  const ts = new Date().toISOString();
  const copy: CVData = {
    ...structuredClone(original),
    id: uuid(),
    name: `${original.name} (copy)`,
    createdAt: ts,
    updatedAt: ts,
  };
  saveCV(copy);
  return copy;
}

export function setActiveCV(id: string): void {
  localStorage.setItem('cvforge:active', id);
}

export function getActiveCV(): string | null {
  return localStorage.getItem('cvforge:active');
}

// --- Session (working draft) helpers ---

export function saveSession(cv: CVData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(cv));
  } catch { /* ignore quota */ }
}

export function loadSession(): CVData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const result = validateCVData(JSON.parse(raw));
    return result.success ? migrateSchema(result.data as CVData) : null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the session draft is newer than the saved named-CV entry —
 * meaning there are unsaved changes from a previous session.
 */
export function hasUnsavedSession(): boolean {
  const session = loadSession();
  if (!session) return false;
  const saved = loadCV(session.id);
  if (!saved) return false;
  return new Date(session.updatedAt) > new Date(saved.updatedAt);
}
