// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { type CheckoutFlow } from '@flows/CheckoutFlow';
import { users } from '@data/users';
import { products } from '@data/products';
import { routes } from '@data/routes';

test.use({ user: users.standard });

// Each case knows how to reach its starting page; the test starts on the inventory page.
const startingPages: { name: string; reach: (flow: CheckoutFlow) => Promise<void> }[] = [
  { name: 'inventory', reach: async () => {} },
  { name: 'cart', reach: (flow) => flow.addToCartAndOpenCart([products.backpack]) },
  { name: 'checkout step one', reach: (flow) => flow.startCheckout([products.backpack]) },
];

test.describe('Logout', () => {
  for (const { name, reach } of startingPages) {
    test(`Logout from the ${name} page returns to the login page`, async ({
      page,
      context,
      inventoryPage,
      checkoutFlow,
      loginPage,
    }) => {
      // 1. Reach the starting page
      await reach(checkoutFlow);

      // 2. Log out from the menu (the header is shared by every page)
      await inventoryPage.header.logout();

      await expect(page).toHaveURL(routes.login);
      await expect(loginPage.usernameInput).toHaveValue('');
      await expect(loginPage.passwordInput).toHaveValue('');
      expect(await context.cookies()).toEqual([]);
    });
  }
});
