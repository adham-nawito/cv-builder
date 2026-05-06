import type { CV } from '@/schemas/cv'
import { migrateSchema } from '@/schemas/cv'

const STORAGE_KEY = 'cvforge:cvs'
const ACTIVE_KEY = 'cvforge:active'

export function checkStorageQuota(): boolean {
  try {
    const test = '__quota_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export function saveCV(cv: CV): void {
  const all = loadAllCVs()
  const idx = all.findIndex((c) => c.id === cv.id)
  if (idx >= 0) {
    all[idx] = cv
  } else {
    all.push(cv)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function loadAllCVs(): CV[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return parsed.map((item) =>
      migrateSchema(item as Record<string, unknown>)
    )
  } catch {
    return []
  }
}

export function loadCV(id: string): CV | null {
  return loadAllCVs().find((c) => c.id === id) ?? null
}

export function deleteCV(id: string): void {
  const all = loadAllCVs().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function setActiveCV(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveCV(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}
