import { test, expect } from '@playwright/test';

test.describe('Admin — Comptes-rendus CA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/ca');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/ca');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des comptes-rendus CA" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des comptes-rendus CA' })).toBeVisible();
  });

  test('le bouton "Ajouter un compte-rendu" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un compte-rendu/i })).toBeVisible();
  });

  test('des comptes-rendus ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border');
    const count = await items.count();
    if (count === 0) {
      await expect(page.locator('text=Aucun compte-rendu pour le moment')).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
    }
  });

  test('le formulaire contient les champs Titre et Date', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un compte-rendu/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    // Champ titre
    await expect(page.locator('input[name="title"], input[placeholder*="Titre"], input[placeholder*="CA"]').first()).toBeVisible();
    // Champ date
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de compte-rendu', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un compte-rendu/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('form')).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque compte-rendu affiche les boutons Modifier, Publier/Dépublier et Supprimer', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun compte-rendu disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Publier|Dépublier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli et Annuler le ferme', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun compte-rendu disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('form')).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le compte-rendu', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun compte-rendu disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('le badge Publié/Brouillon est visible sur chaque compte-rendu', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun compte-rendu disponible');
      return;
    }
    const badge = items.first().locator('.rounded-full').filter({ hasText: /Publié|Brouillon/i });
    await expect(badge).toBeVisible();
  });
});
