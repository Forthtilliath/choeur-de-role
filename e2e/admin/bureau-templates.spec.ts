import { test, expect } from '@playwright/test';

test.describe('Admin — Bureau / Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/bureau/templates');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/bureau/templates');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Templates" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Templates' })).toBeVisible();
  });

  test('la section "Nouveau template" est présente', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Nouveau template' })).toBeVisible();
    await expect(page.locator('input[placeholder*="Concert standard"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Créer et éditer/i })).toBeVisible();
  });

  test('le bouton Créer est désactivé sans nom', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Créer et éditer/i })).toBeDisabled();
  });

  test('le bouton Créer s\'active avec un nom', async ({ page }) => {
    await page.locator('input[placeholder*="Concert standard"]').fill('Template test');
    await expect(page.getByRole('button', { name: /Créer et éditer/i })).toBeEnabled();
  });

  test('des templates ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    const count = await items.count();
    if (count === 0) {
      await expect(page.locator('text=Aucun template')).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
      await expect(items.first().getByRole('link', { name: /Éditer/ })).toBeVisible();
    }
  });

  test('chaque template affiche le lien Éditer et le bouton Supprimer', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun template disponible');
      return;
    }
    await expect(items.first().getByRole('link', { name: /Éditer/ })).toBeVisible();
    await expect(items.first().getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Supprimer un template affiche une confirmation et Annuler conserve le template', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun template disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Annuler' }).click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer un template → éditeur → retour → supprimer', async ({ page }) => {
    test.slow();
    const name = `Template E2E ${Date.now()}`;

    // Création — navigue vers l'éditeur
    await page.locator('input[placeholder*="Concert standard"]').fill(name);
    await page.getByRole('button', { name: /Créer et éditer/i }).click();
    await expect(page).toHaveURL(/\/choristes\/admin\/bureau\/templates\//, { timeout: 5_000 });

    // Retour à la liste
    await page.goto('/choristes/admin/bureau/templates');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });

    // Vérification dans la liste
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    const newItem = items.filter({ hasText: name });
    await expect(newItem.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newItem.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Supprimer' }).click();

    // Vérification suppression
    await expect(newItem).toHaveCount(0, { timeout: 5_000 });
  });
});
