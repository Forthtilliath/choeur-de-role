import { test, expect } from '@playwright/test';

test.describe('Admin — Programmation concerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/concerts');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/concerts');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Programmation" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Programmation' })).toBeVisible();
  });

  test('le bouton "+ Nouvelle saison" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Nouvelle saison/i })).toBeVisible();
  });

  test('des saisons ou un message vide sont affichés', async ({ page }) => {
    const seasons = page.locator('.border.border-border.rounded-2xl');
    const empty = page.locator('text=Aucune saison');
    const count = await seasons.count();
    if (count === 0) {
      await expect(empty).toBeVisible();
    } else {
      await expect(seasons.first()).toBeVisible();
    }
  });

  test('cliquer sur "+ Nouvelle saison" affiche le formulaire', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvelle saison/i }).click();
    await expect(page.locator('input[placeholder="2026-2027"]')).toBeVisible({ timeout: 3_000 });
  });

  test('le formulaire contient le champ label et les boutons Annuler/Créer', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvelle saison/i }).click();
    await expect(page.locator('input[placeholder="2026-2027"]')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Créer$|^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de saison', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvelle saison/i }).click();
    await expect(page.locator('input[placeholder="2026-2027"]')).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('input[placeholder="2026-2027"]')).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque saison affiche les boutons Renommer et Supprimer', async ({ page }) => {
    const seasons = page.locator('main .border.border-border.rounded-2xl');
    if ((await seasons.count()) === 0) {
      test.skip(true, 'Aucune saison de concerts disponible');
      return;
    }
    const first = seasons.first();
    // ConcertsAdminClient season header: ButtonIcon with title="Renommer" + title="Supprimer".
    // `.first()` : une saison peut aussi contenir des boutons Supprimer par concert.
    await expect(first.getByRole('button', { name: /Renommer/i }).first()).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i }).first()).toBeVisible();
  });

  test('Supprimer affiche une confirmation et Annuler conserve la saison', async ({ page }) => {
    const seasons = page.locator('main .border.border-border.rounded-2xl');
    if ((await seasons.count()) === 0) {
      test.skip(true, 'Aucune saison de concerts disponible');
      return;
    }
    const countBefore = await seasons.count();
    await seasons.first().getByRole('button', { name: /Supprimer/i }).first().click();
    // ConcertsAdminClient uses confirmLabel: 'Supprimer' (not default 'Confirmer')
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Annuler' }).click();
    await expect(seasons).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer une saison → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const label = '2099-2098 (E2E)';

    // Création
    await page.getByRole('button', { name: /Nouvelle saison/i }).click();
    await expect(page.locator('input[placeholder="2026-2027"]')).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="2026-2027"]').fill(label);
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();

    // Vérification dans la liste
    const row = page.locator('main .border.border-border.rounded-2xl').filter({ hasText: label });
    await expect(row.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await row.first().getByRole('button', { name: /Supprimer/i }).click();
    // confirmLabel: 'Supprimer' → target the modal overlay to avoid ambiguity
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Supprimer' }).click();

    // Vérification suppression
    await expect(page.locator('main .border.border-border.rounded-2xl').filter({ hasText: label })).not.toBeVisible({ timeout: 5_000 });
  });
});
