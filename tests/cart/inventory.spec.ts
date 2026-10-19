// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts } from '@data/products';

test.use({ user: users.standard });

test.describe('Inventory: add and remove products', () => {
  test('Add several products and verify badge count', async ({ inventoryPage }) => {
    const { backpack, bikeLight, onesie, boltTShirt } = products;

    // 1. Add Backpack and Bike Light, in that order
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();
    await expect(inventoryPage.addToCartButton(boltTShirt.name)).toBeVisible();

    // 2. Add a third product (Onesie)
    await inventoryPage.addToCart(onesie.name);
    await expect(inventoryPage.header.cartBadge).toHaveText('3');
  });

  test('Add all 6 products', async ({ inventoryPage }) => {
    // 1. Click Add to cart on each of the 6 products
    await inventoryPage.addProductsToCart(allProducts.map((p) => p.name));

    await expect(inventoryPage.header.cartBadge).toHaveText('6');
    for (const product of allProducts) {
      await expect(inventoryPage.removeButton(product.name)).toBeVisible();
    }
    await expect(inventoryPage.addToCartButtons).toHaveCount(0);
  });

  test('Remove product from inventory updates badge and button', { tag: '@smoke' }, async ({ inventoryPage }) => {
    const { backpack, bikeLight } = products;

    // 1. Add Backpack and Bike Light, then remove the Backpack
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await inventoryPage.removeFromCart(backpack.name);

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.addToCartButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();
  });

  test('Badge disappears when cart reaches 0', async ({ inventoryPage }) => {
    const { backpack } = products;

    // 1. Add a product and remove it from the inventory
    await inventoryPage.addToCart(backpack.name);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await inventoryPage.removeFromCart(backpack.name);

    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
  });

  test('Re-add a product after removing it', async ({ inventoryPage, cartPage }) => {
    const { backpack } = products;

    // 1. Add, remove and add the same product again
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.removeFromCart(backpack.name);
    await inventoryPage.addToCart(backpack.name);

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();

    await inventoryPage.header.openCart();
    expect(await cartPage.getItems()).toEqual([
      { name: backpack.name, price: backpack.price, quantity: '1' },
    ]);
  });
});
