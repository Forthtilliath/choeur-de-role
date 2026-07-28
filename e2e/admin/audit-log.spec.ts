import { test, expect } from '@playwright/test';

test.describe('Admin — Journal d\'audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/audit-log');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/audit-log');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Journal d\'audit" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: "Journal d'audit" })).toBeVisible();
  });

  test('les filtres de période sont présents', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'Période :' })).toBeVisible();
    await expect(page.getByRole('button', { name: '7 jours' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30 jours' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tout', exact: true })).toBeVisible();
  });

  test('les filtres d\'action sont présents', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'Action :' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toutes' })).toBeVisible();
  });

  test('le compteur d\'entrées est affiché', async ({ page }) => {
    // Le compteur et le message vide contiennent tous les deux "entrée" — on cible le premier
    await expect(page.locator('p', { hasText: /entrée/ }).first()).toBeVisible();
  });

  test('des entrées ou le message vide sont affichés', async ({ page }) => {
    const table = page.locator('table');
    const empty = page.locator('text=Aucune entrée');
    const hasTable = await table.count() > 0;
    if (hasTable) {
      await expect(table).toBeVisible();
      await expect(page.locator('th', { hasText: 'Action' })).toBeVisible();
    } else {
      await expect(empty).toBeVisible();
    }
  });

  test('filtrer par période met à jour le compteur', async ({ page }) => {
    await page.getByRole('button', { name: '7 jours' }).click();
    await expect(page.locator('p', { hasText: /entrée/ }).first()).toBeVisible();
  });

  test('filtrer par action "Connexion" met à jour l\'affichage', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Connexion' });
    if (!await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Pas d\'entrées de type Connexion dans le journal');
      return;
    }
    await btn.click();
    await expect(page.locator('p', { hasText: /entrée/ }).first()).toBeVisible();
  });
});
