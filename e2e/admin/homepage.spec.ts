import { test, expect } from '@playwright/test';

test.describe('Admin — Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/homepage');
    // La page hero est une section plein écran
    await expect(page.locator('section').first()).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/homepage');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le hero avec l\'image de fond est affiché', async ({ page }) => {
    // La section hero contient une image Next.js
    await expect(page.locator('section').first().locator('img')).toBeVisible();
  });

  test('le bouton "Changer la photo" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Changer la photo/i })).toBeVisible();
  });
});
