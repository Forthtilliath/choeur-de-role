import { test, expect } from '@playwright/test';

test.describe('Admin — Bureau / Projets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/bureau/projets');
    await expect(page.locator('main h1, h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/bureau/projets');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Projets" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Projets' })).toBeVisible();
  });

  test('la section "Nouveau projet" est présente', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Nouveau projet' })).toBeVisible();
    await expect(page.locator('input[placeholder*="Concert"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Créer le projet/i })).toBeVisible();
  });

  test('le bouton Créer est désactivé sans nom', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Créer le projet/i });
    await expect(btn).toBeDisabled();
  });

  test('le bouton Créer s\'active avec un nom', async ({ page }) => {
    await page.locator('input[placeholder*="Concert"]').fill('Test projet');
    await expect(page.getByRole('button', { name: /Créer le projet/i })).toBeEnabled();
  });

  test('des projets ou un message vide sont affichés', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    const empty = page.locator('text=Aucun projet');
    const count = await items.count();
    if (count === 0) {
      await expect(empty).toBeVisible();
    } else {
      await expect(items.first()).toBeVisible();
      await expect(items.first().getByRole('link', { name: 'Voir' })).toBeVisible();
    }
  });

  test('chaque projet affiche le bouton Voir et l\'icône Supprimer', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun projet disponible');
      return;
    }
    const first = items.first();
    await expect(first.getByRole('link', { name: 'Voir' })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Supprimer un projet affiche une confirmation et Annuler conserve le projet', async ({ page }) => {
    const items = page.locator('section').nth(1).locator('.rounded-xl.border');
    if ((await items.count()) === 0) {
      test.skip(true, 'Aucun projet disponible');
      return;
    }
    const countBefore = await items.count();
    await items.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Annuler' }).click();
    await expect(items).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer un projet → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const name = `Projet E2E ${Date.now()}`;

    // Création
    await page.locator('input[placeholder*="Concert"]').fill(name);
    await page.getByRole('button', { name: /Créer le projet/i }).click();

    // Vérification dans la liste
    const projects = page.locator('section').nth(1).locator('.rounded-xl.border');
    const newProject = projects.filter({ hasText: name });
    await expect(newProject.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newProject.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Supprimer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Supprimer' }).click();

    // Vérification suppression
    await expect(newProject).toHaveCount(0, { timeout: 5_000 });
  });
});
