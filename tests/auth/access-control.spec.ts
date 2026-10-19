// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { loginErrors } from '@data/messages';
import { routes, protectedPages } from '@data/routes';

test.describe('Access control', () => {
  for (const { url, path } of protectedPages) {
    test(`Unauthenticated access to ${path} redirects to login`, async ({ page, loginPage }) => {
      await page.goto(url);

      await expect(page).toHaveURL(routes.login);
      await expect(loginPage.errorMessage).toHaveText(loginErrors.accessDenied(path));
    });
  }

  test.describe('with a session', () => {
    test.use({ user: users.standard });

    test('After logout, browser Back does not expose the inventory', { tag: '@smoke' }, async ({
      page,
      inventoryPage,
      loginPage,
    }) => {
      // 1. Log out from the menu and go back
      await inventoryPage.header.logout();
      await expect(page).toHaveURL(routes.login);
      await page.goBack();

      await expect(page).toHaveURL(routes.login);
      await expect(loginPage.errorMessage).toHaveText(loginErrors.accessDenied(routes.inventory));
      await expect(inventoryPage.items).toHaveCount(0);
    });

    test('Session cannot be reused on checkout step one after logout', async ({
      page,
      checkoutFlow,
      checkoutInformationPage,
      loginPage,
    }) => {
      // 1. Reach checkout step one and log out from there
      await checkoutFlow.startCheckout([products.backpack]);
      await checkoutInformationPage.header.logout();
      await expect(page).toHaveURL(routes.login);

      // 2. Open the checkout step directly
      await page.goto(routes.checkoutInformation);

      await expect(page).toHaveURL(routes.login);
      await expect(loginPage.errorMessage).toHaveText(loginErrors.accessDenied(routes.checkoutInformation));
    });
  });
});
