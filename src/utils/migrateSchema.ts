import type { CVData } from '@/types/cv';

export const CURRENT_VERSION = '1';

/**
 * Migrate a CVData object from any older schema version to the current one.
 * Add a new `case` block here whenever a breaking schema change is made.
 *
 * v1 (current): Introduced `version` field. All CVs without a version are
 *               treated as pre-v1 and receive the field with no structural changes.
 */
export function migrateSchema(cv: CVData): CVData {
  const version = cv.version ?? '0';

  if (version === CURRENT_VERSION) return cv;

  let migrated = { ...cv };

  // v0 → v1: stamp the version field; no structural changes needed
  if (migrated.version === undefined || migrated.version === '0') {
    migrated = { ...migrated, version: '1' };
  }

  // Future migrations go here, e.g.:
  // if (migrated.version === '1') {
  //   migrated = migrateV1toV2(migrated);
  // }

  return migrated;
}
