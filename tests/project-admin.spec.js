// tests/project-admin.spec.js
// MESAA Portal — Project Admin Tests
// Test 1: Create Project

const { test, expect } = require('@playwright/test');
require('dotenv').config();

const BASE_URL = 'https://dev.mesaaempire.co';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log in and handle the workspace selection screen if it appears.
 * In a fresh Playwright context, the portal shows a workspace combobox
 * before letting the user in — this selects the first available workspace.
 */
async function login(page) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', process.env.EMAIL || '');
  await page.fill('input[type="password"]', process.env.PASSWORD || '');
  await page.click('button[type="submit"]');

  // Wait until we leave the sign-in page
  await page.waitForURL(url => !url.toString().includes('/sign-in'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // If the workspace selector appears, pick the first workspace
  const workspaceCombo = page.locator('[role="combobox"]:has-text("Select workspace")');
  if (await workspaceCombo.isVisible({ timeout: 3000 }).catch(() => false)) {
    await workspaceCombo.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Navigate directly to the Projects admin page.
 */
async function goToProjects(page) {
  await page.goto(`${BASE_URL}/admin/projects`);
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible({ timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Project Admin', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('1. Create Project — fill form and confirm project is saved', async ({ page }) => {
    const ts   = Date.now();
    const name = `[AUTO] Test Project ${ts}`;
    const code = `AUTO-${ts}`;

    // Step 1: Go to Projects page
    await goToProjects(page);

    // Step 2: Open Create Project modal
    await page.click('button:has-text("Create Project")');
    const dialog = page.getByRole('dialog', { name: 'Create Project' });
    await expect(dialog).toBeVisible({ timeout: 8000 });

    // Step 3: Fill in the form
    await dialog.locator('input[placeholder="Enter project name"]').fill(name);
    await dialog.locator('input[placeholder="Enter project code"]').fill(code);

    // Step 4: Select one organisation
    const organizationCheckboxes = dialog.getByRole('checkbox');
    await organizationCheckboxes.first().check();
    for (let index = 1; index < await organizationCheckboxes.count(); index++) {
      await organizationCheckboxes.nth(index).uncheck();
    }

    // Step 5: Submit
    await dialog.getByRole('button', { name: 'Create' }).click();

    // Step 6: Confirm project appears in the table
    await expect(page.locator('table').getByText(name)).toBeVisible({ timeout: 10000 });
  });

});
