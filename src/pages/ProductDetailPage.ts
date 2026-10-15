import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    const details = page.getByTestId('inventory-container');
    this.name = details.getByTestId('inventory-item-name');
    this.description = details.getByTestId('inventory-item-desc');
    this.price = details.getByTestId('inventory-item-price');
    this.addToCartButton = details.getByTestId('add-to-cart');
    this.removeButton = details.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  async waitForLoaded(): Promise<void> {
    await this.backToProductsButton.waitFor();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
