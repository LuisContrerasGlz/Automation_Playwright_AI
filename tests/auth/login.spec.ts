import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { loginErrors } from '@data/messages';
import { pageTitles } from '@data/page-titles';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in with valid credentials', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText(pageTitles.inventory);
    await expect(loginPage.errorMessage).toBeHidden();
  });

  const invalidLogins = [
    { scenario: 'wrong password', user: users.invalidPassword, error: loginErrors.invalidCredentials },
    { scenario: 'locked out user', user: users.lockedOut, error: loginErrors.lockedOut },
  ];

  for (const { scenario, user, error } of invalidLogins) {
    test(`login fails with ${scenario}`, async ({ loginPage }) => {
      await loginPage.login(user);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(loginPage.loginButton).toBeVisible();
    });
  }
});
