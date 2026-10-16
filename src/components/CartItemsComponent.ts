import { type Locator, type Page } from '@playwright/test';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
}

/** Line-item list (`cart-list`) shared by the cart page and the checkout overview. */
export class CartItemsComponent {
  readonly list: Locator;
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.list = page.getByTestId('cart-list');
    this.items = this.list.getByTestId('inventory-item');
  }

  item(productName: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
    });
  }

  async getItems(): Promise<CartItem[]> {
    await this.list.waitFor();
    return this.items.evaluateAll((rows) =>
      rows.map((row) => ({
        name: row.querySelector('[data-test="inventory-item-name"]')?.textContent ?? '',
        price: row.querySelector('[data-test="inventory-item-price"]')?.textContent ?? '',
        quantity: row.querySelector('[data-test="item-quantity"]')?.textContent ?? '',
      })),
    );
  }
}
