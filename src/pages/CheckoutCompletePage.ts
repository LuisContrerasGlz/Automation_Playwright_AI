import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Checkout final step: "Checkout: Complete!". */
export class CheckoutCompletePage extends BasePage {
  readonly title: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.generatePdfButton = page.getByTestId('generate-pdf-order');
  }

  async waitForLoaded(): Promise<void> {
    await this.completeHeader.waitFor();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
