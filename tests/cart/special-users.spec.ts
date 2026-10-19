// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { allProducts, products } from '@data/products';

const names = allProducts.map((p) => p.name);

const buggyUsers = [
  { label: 'problem_user', user: users.problem },
  { label: 'error_user', user: users.error },
];

test.describe('Special users (known buggy users)', () => {
  for (const { label, user } of buggyUsers) {
    test.describe(label, () => {
      test.use({ user });

      test(
        `${label}: add all products`,
        { tag: '@known-bug', annotation: { type: 'issue', description: `${label}: only 3 of the 6 products are added to the cart.` } },
        async ({ inventoryPage }) => {
          test.fail();

          await inventoryPage.addProductsToCart(names);

          await expect(inventoryPage.header.cartBadge).toHaveText('6');
          await expect(inventoryPage.removeButtons).toHaveCount(6);
        },
      );

      test(
        `${label}: remove products`,
        {
          tag: '@known-bug',
          annotation: { type: 'issue', description: `${label}: clicking Remove does not remove the products from the cart.` },
        },
        async ({ inventoryPage }) => {
          test.fail();

          // Backpack is one of the products these users can add, so only the Remove bug is measured.
          const { backpack } = products;
          await inventoryPage.addToCart(backpack.name);
          await expect(inventoryPage.header.cartBadge).toHaveText('1');

          await inventoryPage.removeFromCart(backpack.name);

          await expect(inventoryPage.header.cartBadge).toBeHidden();
          await expect(inventoryPage.addToCartButton(backpack.name)).toBeVisible();
        },
      );
    });
  }
});
