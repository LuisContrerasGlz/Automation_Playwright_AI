import { type Page } from '@playwright/test';
import { HeaderComponent } from '@components/HeaderComponent';
import { FooterComponent } from '@components/FooterComponent';

/** Base for pages shown after login; all of them share the header and footer. */
export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoaded();
  }

  /** Waits for an element unique to the page so reads don't race the SPA render. */
  abstract waitForLoaded(): Promise<void>;
}
