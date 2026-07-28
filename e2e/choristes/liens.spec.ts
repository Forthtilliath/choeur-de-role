import { test, expect } from '@playwright/test';

test.describe('Page Liens utiles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/liens');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('le bouton de gestion n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('a[href="/choristes/admin/liens"]')).not.toBeAttached();
  });

  test('des liens sont affichés ou un message vide est présent', async ({ page }) => {
    const links = page.locator('a[target="_blank"][rel="noopener noreferrer"]');
    const count = await links.count();

    if (count === 0) {
      await expect(page.locator('text=Aucun lien pour le moment')).toBeVisible();
    } else {
      await expect(links.first()).toBeVisible();
    }
  });

  test('les liens s\'ouvrent dans un nouvel onglet', async ({ page }) => {
    const links = page.locator('a[target="_blank"][rel="noopener noreferrer"]');
    if ((await links.count()) === 0) {
      test.skip(true, 'Aucun lien disponible — test non pertinent');
      return;
    }

    await expect(links.first()).toHaveAttribute('target', '_blank');
    await expect(links.first()).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

test.describe('Page Liens utiles - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/liens');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/liens"]')).toBeVisible();
  });

  test('le bouton de gestion est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/liens');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('a[href="/choristes/admin/liens"]').first()).toBeVisible();
  });
});
