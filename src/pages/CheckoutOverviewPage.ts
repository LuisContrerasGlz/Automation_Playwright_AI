import { type Locator, type Page } from '@playwright/test';
import { CartItemsComponent, type CartItem } from '@components/CartItemsComponent';
import { BasePage } from './BasePage';

/** Checkout step two: "Checkout: Overview". */
export class CheckoutOverviewPage extends BasePage {
  readonly title: Locator;
  readonly cartItems: CartItemsComponent;
  readonly items: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartItems = new CartItemsComponent(page);
    this.items = this.cartItems.items;
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async waitForLoaded(): Promise<void> {
    await this.finishButton.waitFor();
  }

  item(productName: string): Locator {
    return this.cartItems.item(productName);
  }

  async getItems(): Promise<CartItem[]> {
    return this.cartItems.getItems();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
