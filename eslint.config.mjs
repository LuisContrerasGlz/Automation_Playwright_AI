import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', '.playwright-mcp/'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Type-aware rules for all TypeScript code (Page Objects, flows, fixtures and specs).
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A missing `await` in Playwright silently skips actions/assertions.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },

  // Playwright rules for the specs: they enforce the project's test conventions.
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-raw-locators': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/valid-title': 'error',
      // Only the project's tags are allowed: @smoke (critical flows) and @known-bug (test.fail() tests).
      'playwright/valid-test-tags': ['error', { allowedTags: ['@smoke', '@known-bug'] }],
    },
  },
);
