import { test as base } from '@playwright/test';
import { type User } from '@data/users';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { CartPage } from '@pages/CartPage';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
};

type Options = {
  /** When set (via `test.use({ user })`), the test starts logged in on the inventory page. */
  user: User | undefined;
};

type AutoFixtures = {
  authenticate: void;
};

export const test = base.extend<Pages & Options & AutoFixtures>({
  user: [undefined, { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  authenticate: [
    async ({ user, loginPage, inventoryPage }, use) => {
      if (user) {
        await loginPage.goto();
        await loginPage.login(user);
        await inventoryPage.waitForLoaded();
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
