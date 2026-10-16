// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { loginErrors } from '@data/messages';
import { routes } from '@data/routes';

const invalidLogins = [
  { scenario: 'empty username and empty password', user: users.empty, error: loginErrors.usernameRequired },
  { scenario: 'empty username', user: users.emptyUsername, error: loginErrors.usernameRequired },
  { scenario: 'empty password', user: users.emptyPassword, error: loginErrors.passwordRequired },
  { scenario: 'unknown user', user: users.unknown, error: loginErrors.invalidCredentials },
  { scenario: 'wrong-case username', user: users.wrongCase, error: loginErrors.invalidCredentials },
];

test.describe('Login validation', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  for (const { scenario, user, error } of invalidLogins) {
    test(`Login is rejected with ${scenario}`, async ({ page, loginPage }) => {
      await loginPage.login(user);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(routes.login);
    });
  }

  test('Login error banner can be dismissed with the X button', async ({ page, loginPage, inventoryPage }) => {
    // 1. Trigger a login error and dismiss it
    await loginPage.login(users.invalidPassword);
    await expect(loginPage.errorMessage).toHaveText(loginErrors.invalidCredentials);
    await loginPage.dismissError();

    await expect(loginPage.errorMessage).toHaveCount(0);
    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.passwordInput).toBeEditable();

    // 2. The form still works: a valid login succeeds
    await loginPage.login(users.standard);
    await expect(page).toHaveURL(routes.inventory);
    await expect(inventoryPage.title).toBeVisible();
  });
});
