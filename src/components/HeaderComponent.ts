import { type Locator, type Page } from '@playwright/test';

/** Header shared by every page after login: cart link/badge and the side menu. */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  /** Present only while the side menu is open. */
  readonly openedMenu: Locator;
  /** Present only while the side menu is closed. */
  readonly closedMenu: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // data-test="open-menu"/"close-menu" sit on non-clickable <img> icons, so target the buttons by role.
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    // The side menu stays rendered (and "visible") off-screen; aria-hidden is the reliable open/closed signal.
    this.openedMenu = page.locator('.bm-menu-wrap[aria-hidden="false"]');
    this.closedMenu = page.locator('.bm-menu-wrap[aria-hidden="true"]');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.openedMenu.waitFor({ state: 'attached' });
  }

  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await this.closedMenu.waitFor({ state: 'attached' });
  }

  async goToAllItems(): Promise<void> {
    await this.openMenu();
    await this.allItemsLink.click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenu();
  }
}
