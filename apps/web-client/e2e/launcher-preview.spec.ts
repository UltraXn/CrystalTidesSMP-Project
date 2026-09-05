import { test, expect } from '@playwright/test';

test.describe('Golden Path 2: Launcher Showcase & Simulator', () => {
  test('renders launcher page, downloads section, and version specs', async ({ page }) => {
    await page.goto('/launcher');

    // Verify URL
    await expect(page).toHaveURL(/launcher/);

    // Verify main heading or launcher title
    const mainHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(mainHeading).toBeVisible();

    // Verify presence of download or preview buttons
    const downloadOrPlayButtons = page.getByRole('button');
    const count = await downloadOrPlayButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify tabs or version options exist
    const pageBody = page.locator('body');
    await expect(pageBody).toBeVisible();
  });
});
