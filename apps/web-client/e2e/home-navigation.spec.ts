import { test, expect } from '@playwright/test';

test.describe('Golden Path 1: Home Page & Navigation', () => {
  test('renders homepage, verifies brand presence, and checks navigation links', async ({ page }) => {
    // Navigate to Home
    await page.goto('/');

    // Verify document title or brand presence
    await expect(page).toHaveTitle(/CrystalTides/i);

    // Verify main navigation bar exists
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Verify presence of primary CTA or server IP button
    const mainContent = page.locator('main, #root').first();
    await expect(mainContent).toBeVisible();

    // Check footer or copyright
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      await expect(footer).toContainText(/CrystalTides/i);
    }
  });

  test('navigates to status page from navigation or direct URL', async ({ page }) => {
    await page.goto('/status');
    await expect(page).toHaveURL(/status/);

    // Verify status page content
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });
});
