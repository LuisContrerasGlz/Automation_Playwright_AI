// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { pageTitles } from '@data/page-titles';

test.use({ user: users.standard });

test.describe('Cart page', () => {
  test('Cart lists items with matching name, price and quantity', async ({ page, inventoryPage, cartPage }) => {
    const { bikeLight, onesie, boltTShirt } = products;
    const selected = [bikeLight, onesie, boltTShirt];

    // 1. Add three products and open the cart
    await inventoryPage.addProductsToCart(selected.map((p) => p.name));
    await inventoryPage.header.openCart();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.title).toHaveText(pageTitles.cart);
    await expect(cartPage.items).toHaveCount(3);
    expect(await cartPage.getItems()).toEqual(
      selected.map((p) => ({ name: p.name, price: p.price, quantity: '1' })),
    );
  });

  test('Empty cart shows no items', async ({ inventoryPage, cartPage }) => {
    // 1. Open the cart without adding products
    await inventoryPage.header.openCart();
    await cartPage.waitForLoaded();

    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('Remove item from cart page', async ({ inventoryPage, cartPage }) => {
    const { backpack, bikeLight } = products;

    // 1. Add two products, open the cart and remove Bike Light
    await inventoryPage.addProductsToCart([backpack.name, bikeLight.name]);
    await inventoryPage.header.openCart();
    await cartPage.removeFromCart(bikeLight.name);

    await expect(cartPage.item(bikeLight.name)).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveText('1');

    await cartPage.continueShopping();
    await inventoryPage.waitForLoaded();
    await expect(inventoryPage.addToCartButton(bikeLight.name)).toBeVisible();
  });

  test('Continue Shopping keeps cart state', async ({ page, inventoryPage, cartPage }) => {
    const { backpack, onesie } = products;

    // 1. With one product in the cart, click Continue Shopping
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.header.openCart();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();

    // 2. Add another product and open the cart again
    await inventoryPage.addToCart(onesie.name);
    await inventoryPage.header.openCart();
    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.item(backpack.name)).toBeVisible();
    await expect(cartPage.item(onesie.name)).toBeVisible();
  });

  test('Open product detail from cart', async ({ inventoryPage, cartPage, productDetailPage }) => {
    const { bikeLight } = products;

    // 1. Click the product name in the cart
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.header.openCart();
    await cartPage.openProduct(bikeLight.name);
    await productDetailPage.waitForLoaded();

    await expect(productDetailPage.name).toHaveText(bikeLight.name);
    await expect(productDetailPage.removeButton).toBeVisible();
  });
});
