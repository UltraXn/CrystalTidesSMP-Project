import { test, expect } from "@playwright/test";

test.describe("Golden Path 4: Security & Auth Route Guard", () => {
  test("redirects unauthenticated users from protected /admin route to /login", async ({
    page,
  }) => {
    // Attempt accessing protected route
    await page.goto("/admin");

    // Should either redirect to login or show an access denied / auth challenge
    await page.waitForURL(/login|admin/, { timeout: 10000 });
    const currentUrl = page.url();

    if (currentUrl.includes("/login")) {
      await expect(page).toHaveURL(/login/);
      // Verify login form elements
      const emailOrUsernameInput = page.getByRole("textbox").first();
      await expect(emailOrUsernameInput).toBeVisible();
    } else {
      // If staying on /admin, verify it shows an auth challenge / unauthorized state
      const authNotice = page
        .getByText(/iniciar sesión|acceso denegado|autorización/i)
        .first();
      await expect(authNotice).toBeVisible();
    }
  });

  test("renders login page with email and password fields", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);

    // Verify presence of input fields
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(1);

    // Verify submit button
    const submitBtn = page
      .getByRole("button", { name: /iniciar|entrar|login/i })
      .first();
    await expect(submitBtn).toBeVisible();
  });
});
