// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts, type Product } from '@data/products';
import { routes } from '@data/routes';
import { expectedSummary } from '@utils/pricing';

test.use({ user: users.standard });

const productSets: { title: string; items: Product[] }[] = [
  { title: 'Backpack + Bike Light', items: [products.backpack, products.bikeLight] },
  { title: 'Onesie alone', items: [products.onesie] },
  { title: 'all 6 products', items: allProducts },
  { title: 'Bolt T-Shirt + Red T-Shirt', items: [products.boltTShirt, products.redTShirt] },
];

test.describe('Checkout overview totals', () => {
  for (const { title, items } of productSets) {
    test(`Totals are correct for ${title}`, async ({ page, checkoutFlow, checkoutOverviewPage }) => {
      // 1. Add the products and reach the overview with valid data
      await checkoutFlow.goToOverview(items);
      await expect(page).toHaveURL(routes.checkoutOverview);

      // 2. Item prices match the inventory and totals are item total + 8% tax
      expect((await checkoutOverviewPage.getItems()).map(({ name, price }) => ({ name, price }))).toEqual(items);
      const summary = expectedSummary(items);
      await expect(checkoutOverviewPage.itemTotal).toHaveText(summary.itemTotal);
      await expect(checkoutOverviewPage.tax).toHaveText(summary.tax);
      await expect(checkoutOverviewPage.total).toHaveText(summary.total);
    });
  }

  test(
    'Item total is rounded for Onesie + Fleece Jacket',
    { tag: '@known-bug', annotation: { type: 'issue', description: 'KB-1: Overview shows "Item total: $57.980000000000004" instead of "$57.98".' } },
    async ({ page, checkoutFlow, checkoutOverviewPage }) => {
      test.fail();
      const items = [products.onesie, products.fleeceJacket];

      await checkoutFlow.goToOverview(items);
      await expect(page).toHaveURL(routes.checkoutOverview);

      const summary = expectedSummary(items);
      await expect(checkoutOverviewPage.itemTotal).toHaveText(summary.itemTotal);
      await expect(checkoutOverviewPage.tax).toHaveText(summary.tax);
      await expect(checkoutOverviewPage.total).toHaveText(summary.total);
    },
  );
});
