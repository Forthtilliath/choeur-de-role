import { test, expect } from '@playwright/test';

test.describe('Admin — Médiathèque', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/mediatheque');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/mediatheque');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Médiathèque" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Médiathèque' })).toBeVisible();
  });

  test('le champ de recherche est présent', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Rechercher un chant"]')).toBeVisible();
  });

  test('le bouton "Ajouter un chant" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un chant/i })).toBeVisible();
  });

  test('des chants ou un message vide sont affichés', async ({ page }) => {
    const songs = page.locator('main [data-song-card]');
    const empty = page.locator('text=Aucun chant pour le moment');
    const hasContent = await songs.count() > 0;
    if (!hasContent) {
      await expect(empty).toBeVisible();
    } else {
      await expect(songs.first()).toBeVisible();
    }
  });

  test('la recherche filtre les chants', async ({ page }) => {
    const search = page.locator('input[placeholder*="Rechercher un chant"]');
    await search.fill('xyzimpossiblestring999');
    await expect(page.locator('text=Aucun chant trouvé')).toBeVisible({ timeout: 3_000 });
  });

  test('le formulaire "Ajouter un chant" contient les champs Titre, Compositeur et Label', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un chant/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un chant' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Alors on danse"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Stromae"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Version concert 2026"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de chant', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un chant/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un chant' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un chant' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque chant affiche les boutons Modifier et Supprimer', async ({ page }) => {
    const songs = page.locator('main [data-song-card]');
    if ((await songs.count()) === 0) {
      test.skip(true, 'Aucun chant disponible');
      return;
    }
    const first = songs.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli avec le titre du chant', async ({ page }) => {
    const songs = page.locator('main [data-song-card]');
    if ((await songs.count()) === 0) {
      test.skip(true, 'Aucun chant disponible');
      return;
    }
    await songs.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le chant' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Alors on danse"]')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le chant' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le chant', async ({ page }) => {
    const songs = page.locator('main [data-song-card]');
    if ((await songs.count()) === 0) {
      test.skip(true, 'Aucun chant disponible');
      return;
    }
    const countBefore = await songs.count();
    await songs.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(songs).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer un chant → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const title = `Chant E2E ${Date.now()}`;

    // Création
    await page.getByRole('button', { name: /Ajouter un chant/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un chant' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="Alors on danse"]').fill(title);
    await page.getByRole('button', { name: /^Ajouter$/ }).click();

    // Vérification dans la liste
    const newSong = page.locator('main [data-song-card]').filter({ hasText: title });
    await expect(newSong.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newSong.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(newSong.first()).not.toBeVisible({ timeout: 5_000 });
  });
});

// ─── Gestion des fichiers ─────────────────────────────────────────────────────

test.describe.serial('Admin — Médiathèque — Gestion des fichiers', () => {
  const FILE_SONG_TITLE = `Chant Fichier E2E ${Date.now()}`;

  test('créer un chant pour les tests de fichiers', async ({ page }) => {
    await page.goto('/choristes/admin/mediatheque');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Ajouter un chant/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un chant' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="Alors on danse"]').fill(FILE_SONG_TITLE);
    await page.getByRole('button', { name: /^Ajouter$/ }).click();
    await expect(page.locator('[data-song-card]').filter({ hasText: FILE_SONG_TITLE })).toBeVisible({ timeout: 8_000 });
  });

  test('ajouter un fichier PDF au chant (upload R2 mocké)', async ({ page }) => {
    await page.route('**/api/repertoire/upload-file', async (route) => {
      await route.fulfill({ json: { success: true } });
    });
    await page.goto('/choristes/admin/mediatheque');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });

    const songCard = page.locator('[data-song-card]').filter({ hasText: FILE_SONG_TITLE });
    await expect(songCard).toBeVisible();
    await songCard.getByTitle('Ajouter un fichier').click();
    await expect(page.locator('h3', { hasText: 'Ajouter un fichier' })).toBeVisible();

    await page.getByRole('button', { name: '📄 Partition', exact: true }).click();

    const pdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
        '3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\n' +
        'xref\n0 4\n0000000000 65535 f \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n117\n%%EOF',
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test-partition.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await page.locator('h3', { hasText: 'Ajouter un fichier' }).locator('..').getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.locator('[data-testid="file-item"]')).toBeVisible({ timeout: 10_000 });
  });

  test('supprimer le fichier ajouté', async ({ page }) => {
    await page.goto('/choristes/admin/mediatheque');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });

    const songCard = page.locator('[data-song-card]').filter({ hasText: FILE_SONG_TITLE });
    await expect(songCard).toBeVisible();
    await songCard.locator('button').first().click();

    const fileItem = page.locator('[data-testid="file-item"]').first();
    await expect(fileItem).toBeVisible({ timeout: 5_000 });
    await fileItem.getByTitle('Supprimer').click();
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(fileItem).not.toBeVisible({ timeout: 5_000 });
  });

  test('supprimer le chant de test (nettoyage)', async ({ page }) => {
    await page.goto('/choristes/admin/mediatheque');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });

    const songCard = page.locator('[data-song-card]').filter({ hasText: FILE_SONG_TITLE });
    await expect(songCard).toBeVisible();
    await songCard.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(songCard).not.toBeVisible({ timeout: 8_000 });
  });
});
