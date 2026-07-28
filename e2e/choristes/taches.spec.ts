import { test, expect } from '@playwright/test';

// La page Tâches est réservée aux membres CA (layout bureau vérifie isCa)

test.describe('Page Tâches — accès restreint', () => {
  test('un membre simple est redirigé', async ({ page }) => {
    await page.goto('/choristes/bureau/taches');
    // handlePageAccess(isCa) redirige vers /choristes si non CA
    await expect(page).not.toHaveURL('/choristes/bureau/taches', { timeout: 10_000 });
  });
});

test.describe('Page Tâches', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/bureau/taches');
    await expect(page.locator('main h1, h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre CA', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/bureau/taches');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre Tâches est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Tâches' })).toBeVisible();
  });

  test('le compteur de projets actifs est affiché', async ({ page }) => {
    await expect(page.locator('p', { hasText: /projet.*actif/ })).toBeVisible();
  });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/bureau/projets"]')).toBeVisible();
  });

  test('des projets sont affichés ou un message vide est présent', async ({ page }) => {
    const projectCards = page.locator('a[href^="/choristes/bureau/taches/"]');
    const count = await projectCards.count();

    if (count === 0) {
      await expect(page.locator('text=Aucun projet pour l\'instant')).toBeVisible();
    } else {
      await expect(projectCards.first()).toBeVisible();
    }
  });

  test('cliquer sur un projet navigue vers son détail', async ({ page }) => {
    const projectCards = page.locator('a[href^="/choristes/bureau/taches/"]');
    if ((await projectCards.count()) === 0) {
      test.skip(true, 'Aucun projet disponible — test non pertinent');
      return;
    }

    const href = await projectCards.first().getAttribute('href');
    await projectCards.first().click();
    await expect(page).toHaveURL(href!, { timeout: 10_000 });
  });
});
