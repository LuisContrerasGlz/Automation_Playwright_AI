// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts } from '@data/products';
import { sortOptions } from '@data/sort-options';
import { expectedOrder } from '@utils/sorting';

test.use({ user: users.standard });

test.describe('Sorting and add to cart', () => {
  test('Add product after sorting Name (Z to A)', async ({ inventoryPage }) => {
    // 1. Sort Z to A and add the first displayed product
    await inventoryPage.sortBy(sortOptions.nameDesc);
    const expectedFirst = expectedOrder(allProducts, sortOptions.nameDesc)[0];
    expect(expectedFirst).toBe(products.redTShirt.name);
    await expect.poll(() => inventoryPage.getProductNames()).toEqual(
      expectedOrder(allProducts, sortOptions.nameDesc),
    );

    await inventoryPage.addToCart(expectedFirst);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(expectedFirst)).toBeVisible();
  });

  test('Add product after sorting Price (low to high) and (high to low)', async ({ inventoryPage, cartPage }) => {
    const cases = [
      { option: sortOptions.priceAsc, product: products.onesie },
      { option: sortOptions.priceDesc, product: products.fleeceJacket },
    ];

    // 1. Sort by price and add the first displayed product
    for (const { option, product } of cases) {
      await inventoryPage.sortBy(option);
      await expect.poll(async () => (await inventoryPage.getProductNames())[0]).toBe(product.name);
      await inventoryPage.addToCart(product.name);
      await expect(inventoryPage.removeButton(product.name)).toBeVisible();
    }

    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await inventoryPage.header.openCart();
    const items = await cartPage.getItems();
    for (const { product } of cases) {
      expect(items).toContainEqual({ name: product.name, price: product.price, quantity: '1' });
    }
  });

  test('Cart state preserved when changing sort order', async ({ inventoryPage }) => {
    const { backpack, bikeLight } = products;

    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);

    // 1. Change the sort order through all options
    for (const option of Object.values(sortOptions)) {
      await inventoryPage.sortBy(option);
      await expect.poll(() => inventoryPage.getProductNames()).toEqual(expectedOrder(allProducts, option));
      await expect(inventoryPage.header.cartBadge).toHaveText('2');
      await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
      await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();
      await expect(inventoryPage.removeButtons).toHaveCount(2);
    }
  });
});
