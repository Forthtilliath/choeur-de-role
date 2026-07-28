import { test, expect } from '@playwright/test';

test.describe('Page CA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/ca');
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
    await expect(page.locator('a[href="/choristes/admin/ca"]')).not.toBeAttached();
  });

  test('des comptes-rendus sont affichés ou un message vide est présent', async ({ page }) => {
    const meetings = page.locator('details.border.border-border');
    const count = await meetings.count();

    if (count === 0) {
      await expect(page.locator('text=Aucun compte-rendu pour le moment')).toBeVisible();
    } else {
      await expect(meetings.first()).toBeVisible();
    }
  });

  test('cliquer sur un compte-rendu l\'ouvre', async ({ page }) => {
    const meetings = page.locator('details.border.border-border');
    if ((await meetings.count()) === 0) {
      test.skip(true, 'Aucun compte-rendu disponible — test non pertinent');
      return;
    }

    const firstSummary = meetings.first().locator('summary');
    await firstSummary.click();

    // L'élément <details> est maintenant ouvert
    await expect(meetings.first()).toHaveAttribute('open', '');
  });
});

test.describe('Page CA - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/ca');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/ca"]')).toBeVisible();
  });

  test('le bouton de gestion est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/ca');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('a[href="/choristes/admin/ca"]').first()).toBeVisible();
  });
});
