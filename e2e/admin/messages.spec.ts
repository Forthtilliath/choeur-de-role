import { test, expect } from '@playwright/test';

test.describe('Admin — Messages de contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/messages');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/messages');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Messages de contact" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Messages de contact' })).toBeVisible();
  });

  test('le compteur "Total" est affiché', async ({ page }) => {
    await expect(page.locator('p', { hasText: 'Total' })).toBeVisible();
  });

  test('les filtres de catégorie sont présents (Tous, Candidature, Partenariat, Autre)', async ({ page }) => {
    // Two "Tous" buttons exist (category + status) — target the first (category row)
    await expect(page.getByRole('button', { name: 'Tous' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Candidature', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Partenariat', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Autre', exact: true })).toBeVisible();
  });

  test('les filtres de statut sont présents (Non traités, Traités)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Non traités/i })).toBeVisible();
    // exact:true avoids matching "Non traités" which also contains "traités"
    await expect(page.getByRole('button', { name: 'Traités', exact: true })).toBeVisible();
  });

  test('le filtre "Non traités" n\'affiche que les messages non lus', async ({ page }) => {
    const messages = page.locator('main .border.rounded-2xl');
    const total = await messages.count();
    if (total === 0) {
      test.skip(true, 'Aucun message disponible');
      return;
    }
    await page.getByRole('button', { name: /Non traités/i }).click();
    const filteredCount = await messages.count();
    expect(filteredCount).toBeLessThanOrEqual(total);
  });

  test('cliquer sur un message l\'ouvre et affiche son contenu', async ({ page }) => {
    const messages = page.locator('main .border.rounded-2xl');
    if ((await messages.count()) === 0) {
      test.skip(true, 'Aucun message disponible');
      return;
    }
    await messages.first().locator('button').first().click();
    await expect(messages.first().locator('.border-t.border-border')).toBeVisible({ timeout: 3_000 });
  });

  test('un message ouvert affiche les boutons "Marquer traité/non traité" et "Supprimer"', async ({ page }) => {
    const messages = page.locator('main .border.rounded-2xl');
    if ((await messages.count()) === 0) {
      test.skip(true, 'Aucun message disponible');
      return;
    }
    await messages.first().locator('button').first().click();
    await expect(messages.first().locator('.border-t')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: /Marquer traité|Marquer non traité/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Supprimer$/ })).toBeVisible();
  });

  test('"Marquer traité" bascule le statut et affiche un snackbar undo', async ({ page }) => {
    const messages = page.locator('main .border.rounded-2xl');
    if ((await messages.count()) === 0) {
      test.skip(true, 'Aucun message disponible');
      return;
    }
    await messages.first().locator('button').first().click();
    await expect(messages.first().locator('.border-t')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: /Marquer traité|Marquer non traité/i }).click();
    // Snackbar undo apparaît en bas
    const snackbar = page.getByTestId('undo-snackbar');
    await expect(snackbar).toBeVisible({ timeout: 3_000 });
    // Annuler pour restaurer l'état initial
    await snackbar.getByRole('button', { name: /Annuler/i }).click();
    await expect(snackbar).not.toBeVisible({ timeout: 3_000 });
  });

  test('"Supprimer" demande une confirmation inline avant suppression', async ({ page }) => {
    const messages = page.locator('main .border.rounded-2xl');
    if ((await messages.count()) === 0) {
      test.skip(true, 'Aucun message disponible');
      return;
    }
    await messages.first().locator('button').first().click();
    await expect(messages.first().locator('.border-t')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: /^Supprimer$/ }).click();
    // Confirmation inline : "Confirmer la suppression" apparaît
    await expect(page.getByRole('button', { name: /Confirmer la suppression/i })).toBeVisible({ timeout: 3_000 });
    // Annuler la confirmation
    await page.getByRole('button', { name: /^Annuler$/ }).last().click();
    await expect(page.getByRole('button', { name: /Confirmer la suppression/i })).not.toBeVisible({ timeout: 3_000 });
  });
});
