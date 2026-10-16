import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { pageTitles } from '@data/page-titles';

// Seed used by the Playwright agents (planner/generator/healer) to bootstrap the page:
// logged in as standard_user on the inventory page.
test.use({ user: users.standard });

test('seed', async ({ inventoryPage }) => {
  await expect(inventoryPage.title).toHaveText(pageTitles.inventory);
});
