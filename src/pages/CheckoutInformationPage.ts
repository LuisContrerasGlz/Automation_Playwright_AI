import { type Locator, type Page } from '@playwright/test';
import { type Customer } from '@data/customers';
import { BasePage } from './BasePage';

/** Checkout step one: "Checkout: Your Information". */
export class CheckoutInformationPage extends BasePage {
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly dismissErrorButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
    this.dismissErrorButton = page.getByTestId('error-button');
  }

  async waitForLoaded(): Promise<void> {
    await this.firstNameInput.waitFor();
  }

  /** Fills every field of the form; empty strings leave a field blank. */
  async fillInformation({ firstName, lastName, postalCode }: Customer): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async submitInformation(customer: Customer): Promise<void> {
    await this.fillInformation(customer);
    await this.continue();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async dismissError(): Promise<void> {
    await this.dismissErrorButton.click();
  }
}
