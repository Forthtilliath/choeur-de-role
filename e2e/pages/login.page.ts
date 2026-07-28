import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly errorMessage: Locator;
  readonly submitButton: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;

  constructor(private page: Page) {
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    // The error paragraph is inside a red-tinted box
    this.errorMessage = page.locator('p').filter({ hasText: 'Email ou mot de passe incorrect' });
    this.submitButton = page.getByRole('button', { name: /Se connecter|Connexion/ });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
