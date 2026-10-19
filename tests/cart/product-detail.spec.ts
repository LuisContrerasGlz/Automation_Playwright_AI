// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';

test.use({ user: users.standard });

test.describe('Product detail page', () => {
  test('Open product detail by name and add to cart', { tag: '@smoke' }, async ({ page, inventoryPage, productDetailPage }) => {
    const { backpack } = products;

    // 1. Click the product name
    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();
    await expect(page).toHaveURL(/\/inventory-item\.html\?id=4$/);
    await expect(productDetailPage.name).toHaveText(backpack.name);
    await expect(productDetailPage.description).toBeVisible();
    await expect(productDetailPage.price).toHaveText(backpack.price);
    await expect(productDetailPage.addToCartButton).toBeVisible();

    // 2. Click Add to cart
    await productDetailPage.addToCart();
    await expect(productDetailPage.header.cartBadge).toHaveText('1');
    await expect(productDetailPage.removeButton).toBeVisible();
  });

  test('Remove product from detail page', async ({ inventoryPage, productDetailPage }) => {
    const { backpack, bikeLight } = products;

    // 1. Add two products, open Backpack detail and remove it
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();
    await expect(productDetailPage.removeButton).toBeVisible();
    await productDetailPage.removeFromCart();

    await expect(productDetailPage.header.cartBadge).toHaveText('1');
    await expect(productDetailPage.addToCartButton).toBeVisible();
  });

  test('State consistent with inventory after Back to products', async ({ inventoryPage, productDetailPage }) => {
    const { backpack } = products;

    // 1. Add from detail and go back
    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();
    await productDetailPage.addToCart();
    await productDetailPage.backToProducts();
    await inventoryPage.waitForLoaded();
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    // 2. Remove from detail and go back
    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();
    await productDetailPage.removeFromCart();
    await productDetailPage.backToProducts();
    await inventoryPage.waitForLoaded();
    await expect(inventoryPage.addToCartButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
  });

  test('Detail page of product added in inventory shows Remove', async ({ inventoryPage, productDetailPage }) => {
    const { backpack } = products;

    // 1. Add Backpack in inventory and open its detail
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openProduct(backpack.name);
    await productDetailPage.waitForLoaded();

    await expect(productDetailPage.removeButton).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeHidden();
  });
});
