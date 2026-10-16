import { type Customer, customers } from '@data/customers';
import { type Product } from '@data/products';
import { type InventoryPage } from '@pages/InventoryPage';
import { type CartPage } from '@pages/CartPage';
import { type CheckoutInformationPage } from '@pages/CheckoutInformationPage';
import { type CheckoutOverviewPage } from '@pages/CheckoutOverviewPage';
import { type CheckoutCompletePage } from '@pages/CheckoutCompletePage';

/**
 * Multi-page business flows built only from Page Object calls, so specs can jump
 * straight to the step under test. Each method starts on the inventory page.
 */
export class CheckoutFlow {
  constructor(
    private readonly inventoryPage: InventoryPage,
    private readonly cartPage: CartPage,
    private readonly checkoutInformationPage: CheckoutInformationPage,
    private readonly checkoutOverviewPage: CheckoutOverviewPage,
    private readonly checkoutCompletePage: CheckoutCompletePage,
  ) {}

  /** Adds the products and opens the cart. */
  async addToCartAndOpenCart(items: Product[]): Promise<void> {
    await this.inventoryPage.addProductsToCart(items.map((item) => item.name));
    await this.inventoryPage.header.openCart();
    await this.cartPage.waitForLoaded();
  }

  /** Ends on checkout step one ("Your Information"). An empty list checks out an empty cart. */
  async startCheckout(items: Product[]): Promise<void> {
    await this.addToCartAndOpenCart(items);
    await this.cartPage.checkout();
    await this.checkoutInformationPage.waitForLoaded();
  }

  /** Ends on checkout step two ("Overview"). */
  async goToOverview(items: Product[], customer: Customer = customers.valid): Promise<void> {
    await this.startCheckout(items);
    await this.checkoutInformationPage.submitInformation(customer);
    await this.checkoutOverviewPage.waitForLoaded();
  }

  /** Ends on the "Checkout: Complete!" page. */
  async completeOrder(items: Product[], customer: Customer = customers.valid): Promise<void> {
    await this.goToOverview(items, customer);
    await this.checkoutOverviewPage.finish();
    await this.checkoutCompletePage.waitForLoaded();
  }
}
