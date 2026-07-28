import { test, expect } from '@playwright/test';

test.describe('Admin — Liens choristes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/liens');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/liens');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des liens" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des liens' })).toBeVisible();
  });

  test('le bouton "Ajouter un lien" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un lien/i })).toBeVisible();
  });

  test('des liens ou un message vide sont affichés', async ({ page }) => {
    const links = page.locator('main .p-4.rounded-xl.border.border-border.bg-background');
    const empty = page.locator('text=Aucun lien pour le moment');
    const count = await links.count();
    if (count === 0) {
      await expect(empty).toBeVisible();
    } else {
      await expect(links.first()).toBeVisible();
    }
  });

  test('le formulaire contient les champs Label, URL, Description et Visibilité', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un lien/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un lien' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Google Drive"]')).toBeVisible();
    await expect(page.locator('input[placeholder="https://drive.google.com/..."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Partitions et fichiers audio"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de lien', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un lien/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un lien' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un lien' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque lien affiche les boutons Modifier, Activer/Désactiver et Supprimer', async ({ page }) => {
    const items = page.locator('main .p-4.rounded-xl.border.border-border.bg-background');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun lien disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Activer|Désactiver/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli et Annuler le ferme', async ({ page }) => {
    const items = page.locator('main .p-4.rounded-xl.border.border-border.bg-background');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun lien disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le lien' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Google Drive"]')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le lien' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le lien', async ({ page }) => {
    const items = page.locator('main .p-4.rounded-xl.border.border-border.bg-background');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun lien disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer → vérifier → supprimer un lien', async ({ page }) => {
    test.slow();
    const label = 'Lien E2E Test';
    const url = 'https://example.com/e2e-test';

    // Création
    await page.getByRole('button', { name: /Ajouter un lien/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un lien' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="Google Drive"]').fill(label);
    await page.locator('input[placeholder="https://drive.google.com/..."]').fill(url);
    await page.getByRole('button', { name: /^Ajouter$/ }).click();

    // Vérification dans la liste
    const newItem = page.locator('main .p-4.rounded-xl.border.border-border.bg-background').filter({ hasText: label });
    await expect(newItem).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newItem.getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(newItem).not.toBeVisible({ timeout: 5_000 });
  });
});
