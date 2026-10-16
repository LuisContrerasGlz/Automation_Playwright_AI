// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { customers } from '@data/customers';
import { routes } from '@data/routes';

test.use({ user: users.standard });

const checkoutStepsOutOfFlow = [
  { name: 'overview', url: routes.checkoutOverview },
  { name: 'complete', url: routes.checkoutComplete },
];

test.describe('Checkout known bugs', () => {
  test(
    'Whitespace-only names and invalid postal code are rejected',
    { annotation: { type: 'issue', description: 'KB-3: step one accepts " " as names and "abc!@#" as postal code.' } },
    async ({ page, checkoutFlow, checkoutInformationPage }) => {
      test.fail();

      await checkoutFlow.startCheckout([products.backpack]);
      await checkoutInformationPage.submitInformation(customers.whitespaceOnly);

      await expect(checkoutInformationPage.errorMessage).toBeVisible();
      await expect(page).toHaveURL(routes.checkoutInformation);
    },
  );

  test(
    'Checkout is blocked when the cart is empty',
    { annotation: { type: 'issue', description: 'KB-2: an empty cart can go through the whole checkout (Item total $0).' } },
    async ({ page, checkoutFlow, checkoutInformationPage }) => {
      test.fail();

      // An empty product list checks out an empty cart
      await checkoutFlow.startCheckout([]);
      await checkoutInformationPage.submitInformation(customers.valid);

      await expect(checkoutInformationPage.errorMessage).toBeVisible();
      await expect(page).not.toHaveURL(routes.checkoutOverview);
    },
  );

  for (const { name, url } of checkoutStepsOutOfFlow) {
    test(
      `Checkout ${name} page cannot be opened directly with an empty cart`,
      {
        annotation: {
          type: 'issue',
          description: 'KB-4: with a session, checkout-step-two and checkout-complete load without going through the flow.',
        },
      },
      async ({ page }) => {
        test.fail();

        await page.goto(url);

        await expect(page).not.toHaveURL(url);
      },
    );
  }
});
