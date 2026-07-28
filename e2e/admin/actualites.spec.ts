import { test, expect } from '@playwright/test';

test.describe('Admin — Actualités', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des actualités" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des actualités' })).toBeVisible();
  });

  test('le bouton "Ajouter une actualité" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter une actualité/i })).toBeVisible();
  });

  test('des actualités ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('main .border.rounded-xl').filter({ hasText: /Brouillon|Publié|Programmée/ });
    const count = await items.count();
    if (count === 0) {
      await expect(page.locator('text=Aucune actualité pour le moment')).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
    }
  });

  test('chaque actualité affiche les boutons Modifier et Supprimer', async ({ page }) => {
    const items = page.locator('main .border.rounded-xl').filter({ hasText: /Brouillon|Publié|Programmée/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune actualité — test non pertinent');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('cliquer sur "Ajouter" affiche le formulaire de création', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter une actualité/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouvelle actualité' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder*="Répétition"]')).toBeVisible();
  });

  test('le bouton Annuler ferme le formulaire de création', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter une actualité/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouvelle actualité' })).toBeVisible({ timeout: 3_000 });

    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Nouvelle actualité' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Modifier ouvre le formulaire pré-rempli et Annuler le ferme', async ({ page }) => {
    const items = page.locator('main .border.rounded-xl').filter({ hasText: /Brouillon|Publié|Programmée/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune actualité — test non pertinent');
      return;
    }
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: "Modifier l'actualité" })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder*="Répétition"]')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: "Modifier l'actualité" })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve l\'actualité', async ({ page }) => {
    const items = page.locator('main .border.rounded-xl').filter({ hasText: /Brouillon|Publié|Programmée/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune actualité — test non pertinent');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('Publier/Dépublier bascule le statut de l\'actualité', async ({ page }) => {
    const items = page.locator('main .border.rounded-xl').filter({ hasText: /Brouillon|Publié/ });
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucune actualité — test non pertinent');
      return;
    }
    const first = items.first();
    const publishBtn = first.getByRole('button', { name: /Publier|Dépublier/i });
    const labelBefore = await publishBtn.textContent();
    await publishBtn.click();
    // Label change après bascule
    await expect(first.getByRole('button', { name: /Publier|Dépublier/i }))
      .not.toHaveText(labelBefore ?? '', { timeout: 5_000 });
    // Remettre l'état initial
    await first.getByRole('button', { name: /Publier|Dépublier/i }).click();
  });

  test('cycle CRUD complet : créer une actualité → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const title = `Actu E2E ${Date.now()}`;

    // Création
    await page.getByRole('button', { name: /Ajouter une actualité/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouvelle actualité' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder*="Répétition annulée"]').fill(title);
    await page.getByRole('button', { name: 'Créer', exact: true }).click();

    // Vérification dans la liste (brouillon par défaut)
    const newItem = page.locator('main .border.rounded-xl').filter({ hasText: title });
    await expect(newItem.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newItem.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(newItem).toHaveCount(0, { timeout: 5_000 });
  });
});
