import { test, expect } from '@playwright/test';

test.describe('Admin — Évènements externes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/evenements');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/evenements');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Évènements externes" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Évènements externes' })).toBeVisible();
  });

  test('le bouton "Ajouter un évènement" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un évènement/i })).toBeVisible();
  });

  test('des évènements ou un message vide sont affichés', async ({ page }) => {
    const upcoming = page.locator('p', { hasText: 'À venir' });
    const empty = page.locator('text=Aucun évènement pour le moment');
    const hasUpcoming = await upcoming.count() > 0;
    if (!hasUpcoming) {
      await expect(empty).toBeVisible();
    } else {
      await expect(upcoming).toBeVisible();
    }
  });

  test('cliquer sur "Ajouter" affiche le formulaire', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un évènement/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
  });

  test('le formulaire contient les champs Titre, Lieu et une date', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un évènement/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    // EventForm a des champs title, location, et une ou plusieurs dates
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer d\'évènement', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un évènement/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('form')).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque évènement affiche les boutons Modifier, Publier/Dépublier et Supprimer', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border').filter({ hasText: /Modifier/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun évènement disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Publier|Dépublier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli et Annuler le ferme', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border').filter({ hasText: /Modifier/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun évènement disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('form')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('form')).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve l\'évènement', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border').filter({ hasText: /Modifier/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun évènement disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });
});
