import { test, expect } from '@playwright/test';

test.describe('Page Trombinoscope', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/trombinoscope');
    await expect(page.locator('h1', { hasText: 'Trombinoscope' })).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('le compteur de choristes est affiché', async ({ page }) => {
    // Le composant affiche "X choriste(s)" sous le titre
    const counter = page.locator('p').filter({ hasText: /choriste/ });
    await expect(counter).toBeVisible();
  });

  test('le tableau des membres est affiché', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('des lignes de membres sont présentes', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    await expect(rows.first()).toBeVisible();
  });

  test('le champ de recherche filtre les membres', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const totalBefore = await rows.count();

    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('xyzimpossible123');

    // Attendre que le filtre s'applique
    await page.waitForTimeout(300);
    const totalAfter = await rows.count();
    expect(totalAfter).toBeLessThan(totalBefore);

    await searchInput.clear();
    await page.waitForTimeout(300);
    expect(await rows.count()).toBe(totalBefore);
  });

  test('les filtres par pupitre sont affichés', async ({ page }) => {
    // VoicePartFilter affiche des boutons de filtre par pupitre
    const voicePartButtons = page.locator('button[class*="rounded"]').filter({ hasText: /\w/ });
    await expect(voicePartButtons.first()).toBeVisible();
  });

  test('le menu de colonnes s\'ouvre et se ferme', async ({ page }) => {
    const colonnesBtn = page.getByRole('button', { name: /Colonnes/ });
    await colonnesBtn.click();
    await expect(page.locator('text=Colonnes affichées')).toBeVisible();

    await colonnesBtn.click();
    await expect(page.locator('text=Colonnes affichées')).not.toBeVisible();
  });

  test('le tri par nom de famille fonctionne', async ({ page }) => {
    const nomHeader = page.locator('thead button', { hasText: /Nom/ });
    if ((await nomHeader.count()) === 0) {
      test.skip(true, 'Colonne Nom non visible — test non pertinent');
      return;
    }

    // Le tri par défaut est last_name asc → premier clic bascule vers desc
    await nomHeader.click();
    await expect(nomHeader.locator('span').last()).toHaveText('↓');

    // Deuxième clic → revient en asc
    await nomHeader.click();
    await expect(nomHeader.locator('span').last()).toHaveText('↑');
  });
});

test.describe('Page Trombinoscope - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/trombinoscope');
    await expect(page.locator('h1', { hasText: 'Trombinoscope' })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/membres"]')).toBeVisible();
  });
});
