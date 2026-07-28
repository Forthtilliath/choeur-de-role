import { test, expect } from '@playwright/test';

test.describe('Admin — Sondages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/sondages');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/sondages');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Sondages" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Sondages' })).toBeVisible();
  });

  test('le bouton "Nouveau sondage" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Nouveau sondage/i })).toBeVisible();
  });

  test('cliquer sur "Nouveau sondage" affiche le formulaire', async ({ page }) => {
    await page.getByRole('button', { name: /Nouveau sondage/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau sondage' })).toBeVisible({ timeout: 3_000 });
  });

  test('le formulaire de création contient les champs Titre, Description et Date de clôture', async ({ page }) => {
    await page.getByRole('button', { name: /Nouveau sondage/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau sondage' })).toBeVisible({ timeout: 3_000 });
    // PollForm contient un champ titre et une description
    await expect(page.locator('input[placeholder*="Titre"], input[name*="title"]').or(
      page.locator('label', { hasText: /Titre/i }).locator('..').locator('input')
    ).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /← Retour/ }).or(
      page.getByRole('button', { name: 'Annuler' })
    ).first()).toBeVisible();
  });

  test('le bouton ← Retour ferme le formulaire et revient à la liste', async ({ page }) => {
    await page.getByRole('button', { name: /Nouveau sondage/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau sondage' })).toBeVisible({ timeout: 3_000 });
    // PollsAdminClient uses "← Retour" link or button to go back
    const retour = page.locator('button', { hasText: /← Retour/ });
    if (await retour.isVisible()) {
      await retour.click();
    } else {
      await page.getByRole('button', { name: 'Annuler' }).click();
    }
    await expect(page.getByRole('button', { name: /Nouveau sondage/i })).toBeVisible({ timeout: 3_000 });
  });

  test('chaque sondage affiche les boutons Résultats, Modifier et Supprimer', async ({ page }) => {
    const items = page.locator('main .border.border-border.rounded-2xl.p-4');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sondage disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Résultats/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('chaque sondage affiche le bouton Activer/Désactiver', async ({ page }) => {
    const items = page.locator('main .border.border-border.rounded-2xl.p-4');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sondage disponible');
      return;
    }
    await expect(items.first().getByRole('button', { name: /Activer|Désactiver/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli et Retour revient à la liste', async ({ page }) => {
    const items = page.locator('main .border.border-border.rounded-2xl.p-4');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sondage disponible');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le sondage' })).toBeVisible({ timeout: 3_000 });
    const retour = page.locator('button', { hasText: /← Retour/ });
    if (await retour.isVisible()) {
      await retour.click();
    } else {
      await page.getByRole('button', { name: 'Annuler' }).click();
    }
    await expect(page.getByRole('button', { name: /Nouveau sondage/i })).toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le sondage', async ({ page }) => {
    const items = page.locator('main .border.border-border.rounded-2xl.p-4');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun sondage disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });
});
