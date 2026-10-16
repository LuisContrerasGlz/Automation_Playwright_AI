// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { routes } from '@data/routes';
import { pageTitles } from '@data/page-titles';

test.use({ user: users.standard });

const twoProducts = [products.backpack, products.bikeLight];

test.describe('Checkout navigation', () => {
  test('Cancel on step one returns to the cart with the same items', async ({
    page,
    checkoutFlow,
    checkoutInformationPage,
    cartPage,
  }) => {
    // 1. Go to step one with two products and cancel
    await checkoutFlow.startCheckout(twoProducts);
    await checkoutInformationPage.cancel();

    await expect(page).toHaveURL(routes.cart);
    await expect(cartPage.title).toHaveText(pageTitles.cart);
    await expect(cartPage.items).toHaveCount(twoProducts.length);
    expect((await cartPage.getItems()).map((item) => item.name)).toEqual(twoProducts.map((p) => p.name));
  });

  test('Cancel on step two returns to the inventory and keeps the cart', async ({
    page,
    checkoutFlow,
    checkoutOverviewPage,
    inventoryPage,
  }) => {
    // 1. Go to step two with two products and cancel
    await checkoutFlow.goToOverview(twoProducts);
    await checkoutOverviewPage.cancel();

    await expect(page).toHaveURL(routes.inventory);
    await expect(inventoryPage.title).toHaveText(pageTitles.inventory);
    await expect(inventoryPage.header.cartBadge).toHaveText(String(twoProducts.length));
  });
});
