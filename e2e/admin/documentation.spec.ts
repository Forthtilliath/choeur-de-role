import { test, expect } from '@playwright/test';

test.describe('Admin — Documentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/documentation');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/documentation');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Documentation" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Documentation' })).toBeVisible();
  });

  test('des sections de documentation sont affichées', async ({ page }) => {
    // Le DocumentationClient affiche des sections avec icônes et titres
    await expect(page.locator('button, [role="button"]').first()).toBeVisible();
  });

  test('la section "Page d\'accueil" est présente', async ({ page }) => {
    await expect(page.locator('text=Page d\'accueil').first()).toBeVisible();
  });
});
