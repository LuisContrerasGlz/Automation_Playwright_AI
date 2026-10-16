import { type Locator, type Page } from '@playwright/test';
import { type User } from '@data/users';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly dismissErrorButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.dismissErrorButton = page.getByTestId('error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login({ username, password }: User): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.dismissErrorButton.click();
  }
}
