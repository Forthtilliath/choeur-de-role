import { test, expect } from '@playwright/test';

test.describe('Admin — Mentions légales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/mentions-legales');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/mentions-legales');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Mentions légales" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Mentions légales' })).toBeVisible();
  });

  test('le formulaire de saisie est présent', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enregistrer|Sauvegarder/i })).toBeVisible();
  });

  test('des sections de données légales sont affichées', async ({ page }) => {
    // LEGAL_FIELDS groupe les données en sections avec h2
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('les champs du formulaire sont éditables', async ({ page }) => {
    const inputs = page.locator('form input[type="text"], form input:not([type="submit"]):not([type="file"])');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
    const firstInput = inputs.first();
    await expect(firstInput).toBeEnabled();
    const original = await firstInput.inputValue();
    await firstInput.fill('Test E2E valeur');
    await expect(firstInput).toHaveValue('Test E2E valeur');
    // Restaurer la valeur originale
    await firstInput.fill(original);
  });

  test('le bouton Enregistrer soumet le formulaire et affiche une confirmation', async ({ page }) => {
    test.slow();
    await page.getByRole('button', { name: /Enregistrer|Sauvegarder/i }).click();
    // Après soumission : toast Sonner OU message de succès inline
    await expect(
      page.locator('[data-sonner-toast]').or(
        page.locator('p', { hasText: /Informations mises à jour|✓/ })
      ).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('plusieurs sections h2 sont présentes dans le formulaire', async ({ page }) => {
    const sections = page.locator('form h2');
    const count = await sections.count();
    expect(count).toBeGreaterThan(1);
  });
});
