import { test, expect } from '@playwright/test';

test.describe('Page Répertoire', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/repertoire');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('le champ de recherche est présent', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Rechercher"]')).toBeVisible();
  });

  test('le bouton de téléchargement groupé est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Tout télécharger/ })).toBeVisible();
  });

  test('les filtres de pupitre sont affichés', async ({ page }) => {
    // Le bouton "Tous" est toujours présent dans les filtres pupitre
    const tousBtn = page.locator('button', { hasText: /^Tous$/ }).first();
    await expect(tousBtn).toBeVisible();
  });

  test('des chants sont affichés ou un message vide est présent', async ({ page }) => {
    // Attendre que le Suspense se résolve
    await page.waitForTimeout(2_000);

    const songCards = page.locator('.border.border-border.rounded-2xl');
    const count = await songCards.count();

    if (count === 0) {
      await expect(page.locator('text=Aucun chant disponible')).toBeVisible();
    } else {
      await expect(songCards.first()).toBeVisible();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('cliquer sur un chant ouvre son accordéon', async ({ page }) => {
    await page.waitForTimeout(2_000);

    const songCards = page.locator('.border.border-border.rounded-2xl');
    if ((await songCards.count()) === 0) {
      test.skip(true, 'Aucun chant disponible — test non pertinent');
      return;
    }

    // Cliquer sur l'en-tête du premier chant (button à l'intérieur de la card)
    const firstCardBtn = songCards.first().locator('button').first();
    await firstCardBtn.click();

    // L'accordéon s'ouvre : le contenu interne apparaît
    const openContent = songCards.first().locator('.border-t.border-border');
    await expect(openContent).toBeVisible({ timeout: 3_000 });
  });

  test('la recherche filtre les chants', async ({ page }) => {
    await page.waitForTimeout(2_000);

    const songCards = page.locator('.border.border-border.rounded-2xl');
    if ((await songCards.count()) === 0) {
      test.skip(true, 'Aucun chant disponible — test non pertinent');
      return;
    }

    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('xyzimpossible123');
    await expect(page.locator('text=Aucun chant trouvé')).toBeVisible({ timeout: 3_000 });

    // Vider la recherche restaure la liste
    await searchInput.clear();
    await expect(page.locator('text=Aucun chant trouvé')).not.toBeVisible({ timeout: 3_000 });
  });

  test('le modal de téléchargement s\'ouvre et se ferme', async ({ page }) => {
    const downloadBtn = page.getByRole('button', { name: /Tout télécharger/ });
    await downloadBtn.click();

    await expect(page.locator('text=Téléchargement groupé')).toBeVisible({ timeout: 3_000 });

    // Fermer via le bouton Annuler
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('text=Téléchargement groupé')).not.toBeVisible();
  });
});

test.describe('Page Répertoire - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/repertoire');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/mediatheque"]')).toBeVisible();
  });
});
