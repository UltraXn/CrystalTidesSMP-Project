import { test, expect } from "@playwright/test";

test.describe("Golden Path 3: Wiki Catalog & Exploration", () => {
  test("renders wiki page and searches or filters documentation entries", async ({
    page,
  }) => {
    await page.goto("/wiki");

    // Verify URL
    await expect(page).toHaveURL(/wiki/);

    // Verify search input or category headers
    const searchInput = page
      .getByPlaceholder(/buscar|search/i)
      .or(page.getByRole("textbox"));
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill("Cristal");
      await expect(searchInput.first()).toHaveValue("Cristal");
    }

    // Verify main content container
    const content = page.locator('main, [role="main"], #root').first();
    await expect(content).toBeVisible();
  });
});
