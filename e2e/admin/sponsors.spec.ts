import { test, expect } from '@playwright/test';

test.describe('Admin — Sponsors / Partenaires', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/sponsors');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/sponsors');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des sponsors" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des sponsors' })).toBeVisible();
  });

  test('le bouton "Ajouter un sponsor" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un sponsor/i })).toBeVisible();
  });

  test('des sponsors ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border.border-border');
    const empty = page.locator('text=Aucun sponsor pour le moment');
    const count = await items.count();
    if (count === 0) {
      await expect(empty).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
    }
  });

  test('le formulaire contient les champs Nom et Site web', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un sponsor/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un sponsor' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('label', { hasText: 'Nom' })).toBeVisible();
    await expect(page.locator('input[placeholder="https://..."]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de sponsor', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un sponsor/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un sponsor' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un sponsor' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque sponsor affiche les boutons Modifier, Activer/Désactiver et Supprimer', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sponsor disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Activer|Désactiver/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli avec le nom du sponsor', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sponsor disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le sponsor' })).toBeVisible({ timeout: 3_000 });
    // Le champ Nom est pré-rempli
    const nameInput = page.locator('label', { hasText: 'Nom' }).locator('..').locator('input');
    await expect(nameInput).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le sponsor' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le sponsor', async ({ page }) => {
    const items = page.locator('main .flex.items-center.gap-4.p-4.rounded-xl.border.border-border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sponsor disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('le formulaire affiche les options Statut (En cours / Passé) et Format (Large / Carré)', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un sponsor/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un sponsor' })).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: 'En cours' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Passé' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Large' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Carré' })).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
  });
});
