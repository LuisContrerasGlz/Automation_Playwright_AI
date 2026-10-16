// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { customers, type Customer } from '@data/customers';
import { checkoutErrors } from '@data/messages';
import { routes } from '@data/routes';

test.use({ user: users.standard });

const missingFieldCases: { title: string; customer: Customer; error: string }[] = [
  {
    title: 'all fields empty',
    customer: { firstName: '', lastName: '', postalCode: '' },
    error: checkoutErrors.firstNameRequired,
  },
  {
    title: 'first name empty',
    customer: { ...customers.valid, firstName: '' },
    error: checkoutErrors.firstNameRequired,
  },
  {
    title: 'last name empty',
    customer: { ...customers.valid, lastName: '' },
    error: checkoutErrors.lastNameRequired,
  },
  {
    title: 'postal code empty',
    customer: { ...customers.valid, postalCode: '' },
    error: checkoutErrors.postalCodeRequired,
  },
];

test.describe('Checkout form validation', () => {
  test.beforeEach(async ({ checkoutFlow }) => {
    await checkoutFlow.startCheckout([products.backpack]);
  });

  for (const { title, customer, error } of missingFieldCases) {
    test(`Step one shows a required-field error when ${title}`, async ({ page, checkoutInformationPage }) => {
      await checkoutInformationPage.submitInformation(customer);

      await expect(checkoutInformationPage.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(routes.checkoutInformation);
    });
  }

  test('Dismissing the error keeps the values and correcting the field advances', async ({
    page,
    checkoutInformationPage,
  }) => {
    // 1. Submit without the postal code
    await checkoutInformationPage.submitInformation({ ...customers.valid, postalCode: '' });
    await expect(checkoutInformationPage.errorMessage).toHaveText(checkoutErrors.postalCodeRequired);

    // 2. Dismiss the error: it disappears and the entered values are kept
    await checkoutInformationPage.dismissError();
    await expect(checkoutInformationPage.errorMessage).toHaveCount(0);
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(customers.valid.firstName);
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(customers.valid.lastName);
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue('');

    // 3. Correct the missing field and continue
    await checkoutInformationPage.postalCodeInput.fill(customers.valid.postalCode);
    await checkoutInformationPage.continue();
    await expect(page).toHaveURL(routes.checkoutOverview);
  });

  test('Cart contents are kept after a validation error and Cancel', async ({
    page,
    checkoutInformationPage,
    cartPage,
  }) => {
    // 1. Trigger a validation error, then cancel
    await checkoutInformationPage.continue();
    await expect(checkoutInformationPage.errorMessage).toHaveText(checkoutErrors.firstNameRequired);
    await checkoutInformationPage.cancel();

    await expect(page).toHaveURL(routes.cart);
    await cartPage.waitForLoaded();
    expect((await cartPage.getItems()).map((i) => i.name)).toEqual([products.backpack.name]);
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });
});
