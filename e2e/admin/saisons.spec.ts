import { test, expect } from '@playwright/test';

test.describe('Admin — Saisons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/saisons');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/saisons');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des saisons" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des saisons' })).toBeVisible();
  });

  test('le bouton "Ajouter une saison" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter une saison/i })).toBeVisible();
  });

  test('des saisons ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border');
    const empty = page.locator('text=Aucune saison pour le moment');
    const count = await items.count();
    if (count === 0) {
      await expect(empty).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
    }
  });

  test('le formulaire contient le champ Label et les boutons Annuler/Ajouter', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter une saison/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter une saison' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="2025-2026"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de saison', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter une saison/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter une saison' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter une saison' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque saison affiche les boutons Modifier, Activer/Désactiver et Supprimer', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune saison disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Activer|Désactiver/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli avec le label existant', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune saison disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier la saison' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="2025-2026"]')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Modifier la saison' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve la saison', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune saison disponible');
      return;
    }
    const first = items.first();
    const label = await first.locator('p.text-sm').first().textContent();
    await first.getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    // Annuler dans la modale conserve la saison
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(page.locator('p', { hasText: label ?? '' })).toBeVisible({ timeout: 3_000 });
  });

  test('cycle CRUD complet : créer → vérifier → supprimer une saison', async ({ page }) => {
    test.slow();
    const label = '9998-9997';

    // Création
    await page.getByRole('button', { name: /Ajouter une saison/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter une saison' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="2025-2026"]').fill(label);
    await page.getByRole('button', { name: /^Ajouter$/ }).click();

    // Vérification dans la liste
    await expect(page.locator('p.text-sm', { hasText: label })).toBeVisible({ timeout: 5_000 });

    // Suppression
    const row = page.locator('.rounded-xl.border.border-border').filter({ hasText: label }).first();
    await row.getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(page.locator('p.text-sm', { hasText: label })).not.toBeVisible({ timeout: 5_000 });
  });
});
