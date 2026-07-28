import { test, expect } from '@playwright/test';

test.describe('Page Mon profil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/profil');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas affiché (page sans breadcrumb admin)', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('les champs Prénom et Nom sont présents', async ({ page }) => {
    // Les inputs ont placeholder="Marie" et placeholder="Dupont"
    await expect(page.locator('input[placeholder="Marie"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Dupont"]')).toBeVisible();
  });

  test('le champ Téléphone est présent', async ({ page }) => {
    await expect(page.locator('input[placeholder="06 12 34 56 78"]')).toBeVisible();
  });

  test('le bouton Enregistrer est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Enregistrer|Sauvegarder/i })).toBeVisible();
  });

  test('la section Double authentification est présente', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Double authentification' })).toBeVisible();
  });

  test('le bouton d\'export de données est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Télécharger mes données/i })).toBeVisible();
  });

  test('le bouton Enregistrer est désactivé sans modification', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Enregistrer les modifications/i })).toBeDisabled();
  });

  test('modifier un champ active le bouton Enregistrer', async ({ page }) => {
    const phoneInput = page.locator('input[placeholder="06 12 34 56 78"]');
    const submitBtn = page.getByRole('button', { name: /Enregistrer les modifications/i });

    const original = await phoneInput.inputValue();
    await phoneInput.fill('07 99 88 77 66');
    await expect(submitBtn).toBeEnabled();

    // Restaurer pour ne pas polluer les données
    await phoneInput.fill(original);
    await expect(submitBtn).toBeDisabled();
  });

  test('les toggles de visibilité du trombinoscope sont présents', async ({ page }) => {
    await expect(page.getByText(/Adresse email/)).toBeVisible();
    await expect(page.getByText(/Numéro de téléphone/)).toBeVisible();
  });

  test('les options de partage d\'anniversaire sont présentes', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ne pas partager', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Date uniquement', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Date et âge', exact: true })).toBeVisible();
  });
});
