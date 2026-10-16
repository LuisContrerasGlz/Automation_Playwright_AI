// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts } from '@data/products';
import { customers } from '@data/customers';
import { routes } from '@data/routes';
import { orderConfirmation } from '@data/checkout';
import { expectedSummary } from '@utils/pricing';

// problem_user and error_user can only add Backpack and Bike Light (separate known bug in tests/cart/special-users.spec.ts)
const cartItems = [products.backpack, products.bikeLight];

test.describe('Special users in checkout', () => {
  test.describe('visual_user', () => {
    test.use({ user: users.visual });

    test('Checkout totals use the real prices', async ({ checkoutFlow, checkoutOverviewPage }) => {
      // 1. Add Backpack and Bike Light and reach the overview
      await checkoutFlow.goToOverview(cartItems);

      const summary = expectedSummary(cartItems);
      await expect(checkoutOverviewPage.itemTotal).toHaveText(summary.itemTotal);
      await expect(checkoutOverviewPage.tax).toHaveText(summary.tax);
      await expect(checkoutOverviewPage.total).toHaveText(summary.total);
    });

    test(
      'Inventory prices match the catalog',
      { annotation: { type: 'issue', description: 'KB-5: visual_user sees random inventory prices that differ from the real ones.' } },
      async ({ inventoryPage }) => {
        test.fail();

        // 1. Read the inventory prices (random on each load, so no concrete values are asserted)
        expect(await inventoryPage.getProducts()).toEqual(allProducts);
      },
    );
  });

  test.describe('problem_user', () => {
    test.use({ user: users.problem });

    test(
      'Checkout form keeps what is typed in each field',
      { annotation: { type: 'issue', description: 'KB-6: the last name is typed into First Name and Last Name stays empty.' } },
      async ({ checkoutFlow, checkoutInformationPage }) => {
        test.fail();

        // 1. Reach checkout step one and type the three fields
        await checkoutFlow.startCheckout(cartItems);
        await checkoutInformationPage.fillInformation(customers.valid);

        await expect(checkoutInformationPage.firstNameInput).toHaveValue(customers.valid.firstName);
        await expect(checkoutInformationPage.lastNameInput).toHaveValue(customers.valid.lastName);
        await expect(checkoutInformationPage.postalCodeInput).toHaveValue(customers.valid.postalCode);
      },
    );
  });

  test.describe('error_user', () => {
    test.use({ user: users.error });

    test(
      'Finish completes the order',
      { annotation: { type: 'issue', description: 'KB-7: Finish does nothing for error_user (JS error), the order is never completed.' } },
      async ({ page, checkoutFlow, checkoutOverviewPage, checkoutCompletePage }) => {
        test.fail();

        // 1. Reach the overview and click Finish
        await checkoutFlow.goToOverview(cartItems);
        await checkoutOverviewPage.finish();

        await expect(page).toHaveURL(routes.checkoutComplete);
        await expect(checkoutCompletePage.completeHeader).toHaveText(orderConfirmation.header);
      },
    );
  });

  test.describe('performance_glitch_user', () => {
    test.use({ user: users.performanceGlitch });

    test('Can complete the full flow', async ({ page, checkoutFlow, checkoutCompletePage }) => {
      // Login takes ~5s, longer than the default expect timeout
      test.slow();

      // 1. Complete the purchase flow
      await checkoutFlow.completeOrder(cartItems);

      await expect(page).toHaveURL(routes.checkoutComplete);
      await expect(checkoutCompletePage.completeHeader).toHaveText(orderConfirmation.header);
    });
  });
});
