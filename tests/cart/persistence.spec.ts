// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts } from '@data/products';
import { sortOptions } from '@data/sort-options';

test.use({ user: users.standard });

test.describe('Cart persistence', () => {
  test('Cart persists after page reload', { tag: '@smoke' }, async ({ inventoryPage }) => {
    const { backpack } = products;

    // 1. Add a product, change the sort order and reload
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.sortBy(sortOptions.nameDesc);
    await inventoryPage.reload();

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    // The sort order is not persisted
    await expect(inventoryPage.sortSelect).toHaveValue(sortOptions.nameAsc);
  });

  test('Cart persists after logout and login', async ({ page, inventoryPage, loginPage, cartPage }) => {
    const { backpack } = products;

    // 1. Add Backpack, log out and log in again
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.header.logout();
    await loginPage.login(users.standard);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await inventoryPage.waitForLoaded();

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await inventoryPage.header.openCart();
    expect((await cartPage.getItems()).map((i) => i.name)).toEqual([backpack.name]);
  });

  test('Reset App State clears cart', async ({ inventoryPage }) => {
    const { backpack, bikeLight } = products;

    // 1. Add products and reset the app state
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await inventoryPage.header.resetAppState();
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);

    // After a reload every button is back to "Add to cart"
    await inventoryPage.reload();
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
    await expect(inventoryPage.addToCartButtons).toHaveCount(allProducts.length);
    await expect(inventoryPage.removeButtons).toHaveCount(0);
  });

  test(
    'Reset App State restores buttons without reload',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'After Reset App State the buttons keep showing "Remove" until the page is reloaded.',
      },
    },
    async ({ inventoryPage }) => {
      test.fail();
      const { backpack, bikeLight } = products;

      await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
      await inventoryPage.header.resetAppState();

      await expect(inventoryPage.removeButtons).toHaveCount(0);
      await expect(inventoryPage.addToCartButton(backpack.name)).toBeVisible();
      await expect(inventoryPage.addToCartButton(bikeLight.name)).toBeVisible();
    },
  );

  test('Cart survives navigation inventory > detail > cart > inventory', async ({
    inventoryPage,
    productDetailPage,
    cartPage,
  }) => {
    const { backpack, bikeLight } = products;

    // 1. Add two products and navigate between pages
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();
    await expect(productDetailPage.header.cartBadge).toHaveText('2');
    await expect(productDetailPage.removeButton).toBeVisible();

    await productDetailPage.header.openCart();
    await cartPage.waitForLoaded();
    await expect(cartPage.header.cartBadge).toHaveText('2');
    await expect(cartPage.items).toHaveCount(2);

    await cartPage.header.goToAllItems();
    await inventoryPage.waitForLoaded();
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();
  });
});
