import { test, expect } from '@playwright/test';

test.describe('Admin — Bienvenue (onboarding)', () => {
  test('la page se charge sans erreur', async ({ page }) => {
    await page.goto('/choristes/admin/bienvenue');
    // Si déjà onboardé → redirige vers tableau-de-bord
    // Si non onboardé → affiche la page d'accueil admin
    await page.waitForURL(/\/choristes\/admin\/(bienvenue|tableau-de-bord)/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('affiche la page d\'onboarding ou redirige', async ({ page }) => {
    await page.goto('/choristes/admin/bienvenue');
    const currentUrl = page.url();
    if (currentUrl.includes('/tableau-de-bord')) {
      // Cas déjà onboardé — OK
      await expect(page.locator('h1')).toBeVisible();
    } else {
      // Page onboarding : h1 "Bienvenue, ..."
      await expect(page.locator('h1', { hasText: /Bienvenue/ })).toBeVisible({ timeout: 10_000 });
    }
  });
});
