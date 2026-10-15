import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
}

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly cartList: Locator;
  readonly items: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartList = page.getByTestId('cart-list');
    this.items = this.cartList.getByTestId('inventory-item');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    await this.cartList.waitFor();
  }

  item(productName: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
    });
  }

  removeButton(productName: string): Locator {
    return this.item(productName).getByRole('button', { name: 'Remove' });
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.item(productName).getByTestId('inventory-item-name').click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async getItems(): Promise<CartItem[]> {
    await this.waitForLoaded();
    return this.items.evaluateAll((rows) =>
      rows.map((row) => ({
        name: row.querySelector('[data-test="inventory-item-name"]')?.textContent ?? '',
        price: row.querySelector('[data-test="inventory-item-price"]')?.textContent ?? '',
        quantity: row.querySelector('[data-test="item-quantity"]')?.textContent ?? '',
      })),
    );
  }
}
