import { type Locator, type Page } from '@playwright/test';

export type SocialNetwork = 'x' | 'facebook' | 'linkedIn';

/** Footer shared by every page after login: social links and copyright. */
export class FooterComponent {
  readonly xLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedInLink: Locator;
  readonly copyright: Locator;
  /** Social links keyed like `externalLinks` so specs can iterate both together. */
  readonly socialLinks: Record<SocialNetwork, Locator>;

  constructor(page: Page) {
    this.xLink = page.getByTestId('social-x');
    this.facebookLink = page.getByTestId('social-facebook');
    this.linkedInLink = page.getByTestId('social-linkedin');
    this.copyright = page.getByTestId('footer-copy');
    this.socialLinks = { x: this.xLink, facebook: this.facebookLink, linkedIn: this.linkedInLink };
  }
}
