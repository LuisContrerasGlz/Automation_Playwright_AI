// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products, allProducts } from '@data/products';
import { customers } from '@data/customers';
import { checkoutInfo, orderConfirmation } from '@data/checkout';
import { routes } from '@data/routes';
import { pageTitles } from '@data/page-titles';
import { expectedSummary } from '@utils/pricing';

test.use({ user: users.standard });

test.describe('Checkout: happy path and totals', () => {
  test('Checkout happy path with two items completes the order', { tag: '@smoke' }, async ({
    page,
    checkoutFlow,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const { backpack, bikeLight } = products;

    // 1. Add two products, open the cart and start the checkout
    await checkoutFlow.addToCartAndOpenCart([backpack, bikeLight]);
    await cartPage.checkout();

    await expect(page).toHaveURL(routes.checkoutInformation);
    await expect(checkoutInformationPage.title).toHaveText(pageTitles.checkoutInformation);
    await expect(checkoutInformationPage.firstNameInput).toBeVisible();
    await expect(checkoutInformationPage.lastNameInput).toBeVisible();
    await expect(checkoutInformationPage.postalCodeInput).toBeVisible();
    await expect(checkoutInformationPage.cancelButton).toBeVisible();
    await expect(checkoutInformationPage.continueButton).toBeVisible();

    // 2. Fill the form and continue to the overview
    await checkoutInformationPage.submitInformation(customers.valid);

    await expect(page).toHaveURL(routes.checkoutOverview);
    await expect(checkoutOverviewPage.title).toHaveText(pageTitles.checkoutOverview);
    expect(await checkoutOverviewPage.getItems()).toEqual([
      { ...backpack, quantity: '1' },
      { ...bikeLight, quantity: '1' },
    ]);
    await expect(checkoutOverviewPage.paymentInfo).toHaveText(checkoutInfo.payment);
    await expect(checkoutOverviewPage.shippingInfo).toHaveText(checkoutInfo.shipping);

    // 3. Finish the order
    await checkoutOverviewPage.finish();

    await expect(page).toHaveURL(routes.checkoutComplete);
    await expect(checkoutCompletePage.title).toHaveText(pageTitles.checkoutComplete);
    await expect(checkoutCompletePage.completeHeader).toHaveText(orderConfirmation.header);
    await expect(checkoutCompletePage.completeText).toHaveText(orderConfirmation.text);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.generatePdfButton).toBeVisible();
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);
  });

  test('Overview lists only the items left in the cart after removing one', async ({
    page,
    checkoutFlow,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    const { backpack, bikeLight, onesie } = products;

    // 1. Add three products, remove one from the cart page and continue the checkout
    await checkoutFlow.addToCartAndOpenCart([backpack, bikeLight, onesie]);
    await expect(cartPage.items).toHaveCount(3);
    await cartPage.removeFromCart(bikeLight.name);
    await expect(cartPage.items).toHaveCount(2);

    await cartPage.checkout();
    await checkoutInformationPage.submitInformation(customers.valid);

    await expect(page).toHaveURL(routes.checkoutOverview);
    expect(await checkoutOverviewPage.getItems()).toEqual([
      { ...backpack, quantity: '1' },
      { ...onesie, quantity: '1' },
    ]);
    const summary = expectedSummary([backpack, onesie]);
    await expect(checkoutOverviewPage.itemTotal).toHaveText(summary.itemTotal);
    await expect(checkoutOverviewPage.tax).toHaveText(summary.tax);
    await expect(checkoutOverviewPage.total).toHaveText(summary.total);
  });

  test('Cart is emptied after finishing the checkout and Back Home', async ({
    page,
    checkoutFlow,
    inventoryPage,
    cartPage,
    checkoutCompletePage,
  }) => {
    const { backpack, bikeLight } = products;

    // 1. Complete an order and go back home
    await checkoutFlow.completeOrder([backpack, bikeLight]);
    await checkoutCompletePage.backHome();

    await expect(page).toHaveURL(routes.inventory);
    await inventoryPage.waitForLoaded();
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
    await expect(inventoryPage.addToCartButtons).toHaveCount(allProducts.length);
    await expect(inventoryPage.removeButtons).toHaveCount(0);

    // 2. Open the cart
    await inventoryPage.header.openCart();
    await cartPage.waitForLoaded();
    await expect(cartPage.items).toHaveCount(0);
  });
});
