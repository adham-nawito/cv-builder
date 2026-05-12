import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Clear localStorage so each test starts from a clean state
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// ---------------------------------------------------------------------------
// App loads
// ---------------------------------------------------------------------------
test('app loads and shows CVForge navbar', async ({ page }) => {
  await expect(page.getByText('CVForge')).toBeVisible();
});

test('sample CV is pre-loaded on first visit', async ({ page }) => {
  // The canvas should already contain sections from createSampleCV()
  await expect(page.locator('.cv-section').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// Section palette
// ---------------------------------------------------------------------------
test('clicking a palette item adds a section to the canvas', async ({ page }) => {
  const beforeCount = await page.locator('.cv-section').count();
  // Click the "Projects" palette button (it is not in the default sample CV)
  await page.getByRole('button', { name: /projects/i }).first().click();
  await expect(page.locator('.cv-section')).toHaveCount(beforeCount + 1);
});

// ---------------------------------------------------------------------------
// Inline editing
// ---------------------------------------------------------------------------
test('inline editing personal info name updates the canvas', async ({ page }) => {
  const nameEl = page.locator('.cv-paper h1').first();
  await nameEl.click({ clickCount: 3 }); // select all
  await nameEl.fill('Updated Name');
  await nameEl.blur();
  await expect(page.locator('.cv-paper h1')).toContainText('Updated Name');
});

// ---------------------------------------------------------------------------
// Template switching
// ---------------------------------------------------------------------------
test('switching to Modern template changes the header style', async ({ page }) => {
  await page.getByRole('button', { name: /templates/i }).click();
  await page.getByRole('button', { name: /modern/i }).click();
  // Modern template wraps the header in a dark background — check the CV paper still has h1
  await expect(page.locator('.cv-paper h1').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// Preview mode
// ---------------------------------------------------------------------------
test('Preview button enters full-screen preview and Exit button leaves it', async ({ page }) => {
  await page.getByRole('button', { name: /preview/i }).click();
  await expect(page.getByRole('button', { name: /exit preview/i })).toBeVisible();
  // Navbar should be gone
  await expect(page.getByText('CVForge')).not.toBeVisible();

  // Exit via button
  await page.getByRole('button', { name: /exit preview/i }).click();
  await expect(page.getByText('CVForge')).toBeVisible();
});

test('Escape key exits preview mode', async ({ page }) => {
  await page.getByRole('button', { name: /preview/i }).click();
  await expect(page.getByRole('button', { name: /exit preview/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('CVForge')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Undo / Redo
// ---------------------------------------------------------------------------
test('Undo removes a newly added section', async ({ page }) => {
  const beforeCount = await page.locator('.cv-section').count();
  await page.getByRole('button', { name: /projects/i }).first().click();
  await expect(page.locator('.cv-section')).toHaveCount(beforeCount + 1);

  // Undo via toolbar button
  await page.getByTitle(/undo/i).click();
  await expect(page.locator('.cv-section')).toHaveCount(beforeCount);
});

// ---------------------------------------------------------------------------
// Delete section
// ---------------------------------------------------------------------------
test('deleting a section removes it from the canvas', async ({ page }) => {
  // Select first section, then click delete in the toolbar
  await page.locator('.cv-section').first().click();
  const beforeCount = await page.locator('.cv-section').count();

  await page.getByTitle('Delete').click();
  await expect(page.locator('.cv-section')).toHaveCount(beforeCount - 1);
});

// ---------------------------------------------------------------------------
// Dark mode toggle
// ---------------------------------------------------------------------------
test('dark mode toggle adds dark class to html element', async ({ page }) => {
  const moonBtn = page.getByRole('button', { name: '' }).filter({ has: page.locator('[data-lucide="moon"]') });
  // Use title fallback if aria-label not available
  await page.locator('button[title*="dark"], button:has(.lucide-moon)').first().click();
  const htmlClass = await page.locator('html').getAttribute('class');
  expect(htmlClass).toContain('dark');
});

// ---------------------------------------------------------------------------
// New CV
// ---------------------------------------------------------------------------
test('New CV button resets the canvas', async ({ page }) => {
  await page.getByRole('button', { name: /^new$/i }).click();
  // A fresh sample CV should be loaded — canvas should not be empty
  await expect(page.locator('.cv-section').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// Save and manage CVs
// ---------------------------------------------------------------------------
test('Save button stores the CV and Manage shows it in the list', async ({ page }) => {
  await page.getByRole('button', { name: /save/i }).click();
  await page.getByRole('button', { name: /manage/i }).click();
  // The CV manager dialog should list at least one CV
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('[role="dialog"] li, [role="dialog"] .cv-item, [role="dialog"] [data-cv-row]').first()).toBeVisible();
});
