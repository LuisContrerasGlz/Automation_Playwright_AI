import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';

test.describe('Cart', () => {
  test('standard user can add a t-shirt to the cart', async ({ page, loginPage, inventoryPage }) => {
    const tShirt = products.boltTShirt.name;

    await test.step('Log in as standard user', async () => {
      await loginPage.goto();
      await loginPage.login(users.standard);
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(inventoryPage.title).toHaveText('Products');
    });

    await test.step(`Add "${tShirt}" to the cart`, async () => {
      await inventoryPage.addToCart(tShirt);
    });

    await test.step('Verify the cart contains 1 item', async () => {
      await expect(inventoryPage.header.cartBadge).toHaveText('1');
      await expect(inventoryPage.removeButton(tShirt)).toBeVisible();
    });
  });
});
