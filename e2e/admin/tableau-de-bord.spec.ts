import { test, expect } from '@playwright/test';

test.describe('Admin — Tableau de bord', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/tableau-de-bord');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/tableau-de-bord');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Tableau de bord" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Tableau de bord' })).toBeVisible();
  });

  test('les StatCards principales sont présentes', async ({ page }) => {
    const main = page.locator('main');
    // Chaque StatCard est un <a> avec un grand nombre et un libellé
    await expect(main.locator('a[href="/choristes/admin/membres"]').filter({ hasText: /Membres/ }).first()).toBeVisible();
    await expect(main.locator('a[href="/choristes/admin/mediatheque"]').filter({ hasText: /Répertoire/ }).first()).toBeVisible();
    await expect(main.locator('a[href="/choristes/admin/galerie"]').filter({ hasText: /Galerie/ }).first()).toBeVisible();
    await expect(main.locator('a[href="/choristes/admin/sondages"]').filter({ hasText: /Sondages/ }).first()).toBeVisible();
    await expect(main.locator('a[href="/choristes/admin/concerts"]').first()).toBeVisible();
  });

  test('la StatCard Actualités pointe vers /choristes/admin', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.locator('a[href="/choristes/admin"]').filter({ hasText: /Actualités/ }).first()).toBeVisible();
  });

  test('la section saison en cours est affichée si elle existe', async ({ page }) => {
    const seasonSection = page.locator('h2', { hasText: /Saison en cours/ });
    const count = await seasonSection.count();
    if (count > 0) {
      await expect(seasonSection).toBeVisible();
    }
  });

  test('la table d\'activité récente est affichée si elle existe', async ({ page }) => {
    const auditSection = page.locator('h2', { hasText: 'Activité récente' });
    const count = await auditSection.count();
    if (count > 0) {
      await expect(auditSection).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th', { hasText: 'Action' })).toBeVisible();
    }
  });
});
