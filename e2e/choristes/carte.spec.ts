import { test, expect } from '@playwright/test';

test.describe('Page Carte', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/carte');
    // Attendre que la carte Leaflet se charge (remplace "Loading map...")
    await page.waitForSelector('.leaflet-container', { timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le compteur de choristes géolocalisés est affiché', async ({ page }) => {
    await expect(page.locator('p', { hasText: /choriste.*géolocalisé/ })).toBeVisible();
  });

  test('la carte Leaflet est rendue', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('les contrôles de carte sont présents', async ({ page }) => {
    // Leaflet ajoute les boutons de zoom et l'attribution OSM
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
    await expect(page.locator('.leaflet-control-attribution')).toBeVisible();
  });

  test('le message membre (sans vue CA) est affiché', async ({ page }) => {
    await expect(
      page.locator('p', { hasText: 'Seuls les choristes ayant partagé leur adresse' }),
    ).toBeVisible();
  });
});

test.describe('Page Carte - vue CA', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('la vue CA affiche le message administrateur', async ({ page }) => {
    await page.goto('/choristes/carte');
    await page.waitForSelector('.leaflet-container', { timeout: 15_000 });
    await expect(
      page.locator('p', { hasText: 'Vue CA' }),
    ).toBeVisible();
  });

  test('le panneau admin n\'est pas affiché (page sans breadcrumb admin)', async ({ page }) => {
    await page.goto('/choristes/carte');
    await page.waitForSelector('.leaflet-container', { timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });
});
