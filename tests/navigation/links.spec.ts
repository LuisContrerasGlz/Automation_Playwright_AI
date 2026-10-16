// spec: specs/coverage-gaps.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { externalLinks } from '@data/links';
import { type SocialNetwork } from '@components/FooterComponent';

test.use({ user: users.standard });

const footerLinks: { name: string; network: SocialNetwork }[] = [
  { name: 'X', network: 'x' },
  { name: 'Facebook', network: 'facebook' },
  { name: 'LinkedIn', network: 'linkedIn' },
];

test.describe('Footer and menu external links', () => {
  // 1. Check href (and target) without navigating to third-party sites
  for (const { name, network } of footerLinks) {
    test(`Footer ${name} link opens the expected URL in a new tab`, async ({ inventoryPage }) => {
      const link = inventoryPage.footer.socialLinks[network];

      await expect(link).toHaveAttribute('href', externalLinks[network]);
      await expect(link).toHaveAttribute('target', '_blank');
    });
  }

  test('Menu About link points to the expected URL', async ({ inventoryPage }) => {
    await inventoryPage.header.openMenu();

    await expect(inventoryPage.header.aboutLink).toHaveAttribute('href', externalLinks.about);
  });
});
