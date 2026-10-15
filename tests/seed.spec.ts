import { test, expect } from '@fixtures/pages.fixture';

// Seed used by the Playwright agents (planner/generator/healer) to bootstrap the page.
test('seed', async ({ loginPage }) => {
  await loginPage.goto();
  await expect(loginPage.loginButton).toBeVisible();
});
