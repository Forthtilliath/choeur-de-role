import { test, expect } from '@playwright/test';

test.describe('Admin — Pupitres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/pupitres');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/pupitres');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des pupitres" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des pupitres' })).toBeVisible();
  });

  test('le bouton "Ajouter un pupitre" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un pupitre/i })).toBeVisible();
  });

  test('des pupitres sont affichés par défaut', async ({ page }) => {
    // Il y a toujours des pupitres par défaut (Soprano, Alto, etc.)
    const items = page.locator('main .rounded-xl.border.border-border.bg-background');
    await expect(items.first()).toBeVisible({ timeout: 5_000 });
  });

  test('le formulaire contient les champs Nom et Groupe', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un pupitre/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un pupitre' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Ténor"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Hommes"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ajouter$/ })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de pupitre', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un pupitre/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un pupitre' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un pupitre' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque pupitre affiche les boutons Modifier et Supprimer', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border.bg-background');
    const first = items.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Modifier ouvre le formulaire pré-rempli avec le nom du pupitre', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border.bg-background');
    await items.first().getByRole('button', { name: /Modifier/i }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le pupitre' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Ténor"]')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Modifier le pupitre' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('Supprimer affiche une confirmation et Annuler conserve le pupitre', async ({ page }) => {
    const items = page.locator('main .rounded-xl.border.border-border.bg-background');
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer → vérifier → supprimer un pupitre', async ({ page }) => {
    test.slow();
    const name = 'Pupitre E2E Test';

    // Création
    await page.getByRole('button', { name: /Ajouter un pupitre/i }).click();
    await expect(page.locator('h2', { hasText: 'Ajouter un pupitre' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="Ténor"]').fill(name);
    await page.getByRole('button', { name: /^Ajouter$/ }).click();

    // Vérification dans la liste
    const newItem = page.locator('main .rounded-xl.border.border-border.bg-background').filter({ hasText: name });
    await expect(newItem).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newItem.getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(newItem).not.toBeVisible({ timeout: 5_000 });
  });
});
