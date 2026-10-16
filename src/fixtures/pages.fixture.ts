import { test as base } from '@playwright/test';
import { type User } from '@data/users';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutInformationPage } from '@pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '@pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '@pages/CheckoutCompletePage';
import { CheckoutFlow } from '@flows/CheckoutFlow';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type Flows = {
  checkoutFlow: CheckoutFlow;
};

type Options = {
  /** When set (via `test.use({ user })`), the test starts logged in on the inventory page. */
  user: User | undefined;
};

type AutoFixtures = {
  authenticate: void;
};

export const test = base.extend<Pages & Flows & Options & AutoFixtures>({
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
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  checkoutFlow: async (
    { inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage },
    use,
  ) => {
    await use(
      new CheckoutFlow(inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage),
    );
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
