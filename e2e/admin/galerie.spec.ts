import { test, expect } from '@playwright/test';

test.describe('Admin — Galerie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/galerie');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/galerie');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Galerie — Administration" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Galerie — Administration' })).toBeVisible();
  });

  test('le bouton "Nouvel album" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Nouvel album/i })).toBeVisible();
  });

  test('les statistiques de la galerie sont affichées', async ({ page }) => {
    // GalerieStats: div.border.border-border.rounded-2xl (collapsible button "Statistiques")
    await expect(page.getByRole('button', { name: /Statistiques/i })).toBeVisible();
  });

  test('cliquer sur "Nouvel album" affiche le formulaire d\'ajout', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvel album/i }).click();
    // AddAlbumForm: un input de titre s'affiche
    await expect(page.locator('input').first()).toBeVisible({ timeout: 3_000 });
  });

  test('le formulaire d\'ajout contient un champ titre et les boutons Créer/Annuler', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvel album/i }).click();
    await expect(page.locator('input').first()).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: /Annuler/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Créer|Ajouter/i })).toBeVisible();
  });

  test('Annuler ferme le formulaire d\'ajout', async ({ page }) => {
    await page.getByRole('button', { name: /Nouvel album/i }).click();
    await expect(page.locator('input').first()).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: /Annuler/i }).click();
    await expect(page.getByRole('button', { name: /Nouvel album/i })).toBeVisible({ timeout: 3_000 });
  });

  test('chaque album affiche les boutons Publier/Dépublier et Supprimer', async ({ page }) => {
    // Les albums sont des AlbumCard avec DnD
    const albums = page.locator('main .rounded-2xl.border').filter({ hasText: /Publier|Dépublier/ });
    if ((await albums.count()) === 0) {
      test.skip(true, 'Aucun album disponible');
      return;
    }
    const first = albums.first();
    await expect(first.getByRole('button', { name: /Publier|Dépublier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Supprimer un album affiche une confirmation et Annuler conserve l\'album', async ({ page }) => {
    const albums = page.locator('main .rounded-2xl.border').filter({ hasText: /Publier|Dépublier/ });
    if ((await albums.count()) === 0) {
      test.skip(true, 'Aucun album disponible');
      return;
    }
    const countBefore = await albums.count();
    await albums.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(albums).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer un album → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const title = 'Album E2E Test';

    // Création
    await page.getByRole('button', { name: /Nouvel album/i }).click();
    await expect(page.locator('input').first()).toBeVisible({ timeout: 3_000 });
    await page.locator('input').first().fill(title);
    await page.getByRole('button', { name: /Créer|Ajouter/i }).click();

    // Vérification dans la liste
    const albumCard = page.locator('main .rounded-2xl.border').filter({ hasText: title });
    await expect(albumCard.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await albumCard.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(page.locator('main .rounded-2xl.border', { hasText: title })).not.toBeVisible({ timeout: 5_000 });
  });
});
