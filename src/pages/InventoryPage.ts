import { type Locator, type Page } from '@playwright/test';
import { type Product } from '@data/products';
import { type SortOption } from '@data/sort-options';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly items: Locator;
  readonly sortSelect: Locator;
  /** Every "Add to cart" button in the list (useful for counting). */
  readonly addToCartButtons: Locator;
  /** Every "Remove" button in the list (useful for counting). */
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.items = this.inventoryList.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.addToCartButtons = this.items.getByRole('button', { name: 'Add to cart' });
    this.removeButtons = this.items.getByRole('button', { name: 'Remove' });
  }

  async waitForLoaded(): Promise<void> {
    await this.inventoryList.waitFor();
  }

  productCard(productName: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
    });
  }

  addToCartButton(productName: string): Locator {
    return this.productCard(productName).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(productName: string): Locator {
    return this.productCard(productName).getByRole('button', { name: 'Remove' });
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async addProductsToCart(productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addToCart(name);
    }
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.productCard(productName).getByTestId('inventory-item-name').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    await this.waitForLoaded();
    return this.items.getByTestId('inventory-item-name').allTextContents();
  }

  async getProducts(): Promise<Product[]> {
    await this.waitForLoaded();
    const names = await this.items.getByTestId('inventory-item-name').allTextContents();
    const prices = await this.items.getByTestId('inventory-item-price').allTextContents();
    return names.map((name, i) => ({ name, price: prices[i] }));
  }
}
