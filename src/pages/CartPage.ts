import { type Locator, type Page } from '@playwright/test';
import { CartItemsComponent, type CartItem } from '@components/CartItemsComponent';
import { BasePage } from './BasePage';

export type { CartItem };

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly cartItems: CartItemsComponent;
  readonly cartList: Locator;
  readonly items: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartItems = new CartItemsComponent(page);
    this.cartList = this.cartItems.list;
    this.items = this.cartItems.items;
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
    return this.cartItems.item(productName);
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

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async getItems(): Promise<CartItem[]> {
    return this.cartItems.getItems();
  }
}
