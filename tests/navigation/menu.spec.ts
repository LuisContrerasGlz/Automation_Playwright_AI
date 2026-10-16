// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { routes } from '@data/routes';
import { pageTitles } from '@data/page-titles';

test.use({ user: users.standard });

test.describe('Side menu', () => {
  test('All Items from the cart returns to the inventory and closes the menu', async ({ page, checkoutFlow, inventoryPage }) => {
    // 1. From the cart, open the menu and click All Items
    await checkoutFlow.addToCartAndOpenCart([products.backpack]);
    await expect(page).toHaveURL(routes.cart);

    await inventoryPage.header.goToAllItems();

    await expect(page).toHaveURL(routes.inventory);
    await expect(inventoryPage.title).toHaveText(pageTitles.inventory);
    await expect(inventoryPage.header.closedMenu).toBeAttached();
  });

  test('Open Menu shows its items and Close Menu hides them', async ({ inventoryPage }) => {
    const { header } = inventoryPage;

    // 1. Open the menu. The links stay rendered off-screen (and count as "visible") even
    // when the menu is closed, so the open state is asserted through `openedMenu`.
    await header.openMenu();

    await expect(header.openedMenu).toBeAttached();
    await expect(header.allItemsLink).toBeVisible();
    await expect(header.aboutLink).toBeVisible();
    await expect(header.logoutLink).toBeVisible();
    await expect(header.resetAppStateLink).toBeVisible();

    // 2. Close the menu
    await header.closeMenu();

    await expect(header.closedMenu).toBeAttached();
    await expect(header.openedMenu).toHaveCount(0);
  });
});
