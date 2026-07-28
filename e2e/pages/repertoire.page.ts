import type { Page, Locator } from '@playwright/test';

export class RepertoirePage {
  readonly songCards: Locator;
  readonly searchInput: Locator;
  readonly openFileButtons: Locator;
  readonly audioPlayButtons: Locator;

  constructor(private page: Page) {
    this.songCards = page.locator('[data-song-card]');
    this.searchInput = page.locator('input[placeholder*="Rechercher"]');
    this.openFileButtons = page.locator('[data-testid="open-file-btn"]');
    this.audioPlayButtons = page.getByRole('button', { name: 'Lecture' });
  }

  async goto() {
    await this.page.goto('/choristes/repertoire');
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  voicePartButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true }).first();
  }
}
