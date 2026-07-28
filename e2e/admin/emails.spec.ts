import { test, expect } from '@playwright/test';

test.describe('Admin — Prévisualisation des emails', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/emails');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/emails');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Prévisualisation des emails" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Prévisualisation des emails' })).toBeVisible();
  });

  test('les onglets de templates sont présents', async ({ page }) => {
    // Bienvenue, Réinit. mot de passe, Changement d'email, Candidature
    await expect(page.getByRole('button', { name: 'Bienvenue' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Réinit|mot de passe/i })).toBeVisible();
  });

  test('l\'aperçu de l\'email est affiché dans un iframe', async ({ page }) => {
    await expect(page.locator('iframe[title*="Aperçu"]')).toBeVisible();
  });
});
