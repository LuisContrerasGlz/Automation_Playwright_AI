import { type Page } from '@playwright/test';
import { HeaderComponent } from '@components/HeaderComponent';

/** Base for pages shown after login; all of them share the header. */
export abstract class BasePage {
  readonly header: HeaderComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoaded();
  }

  /** Waits for an element unique to the page so reads don't race the SPA render. */
  abstract waitForLoaded(): Promise<void>;
}
