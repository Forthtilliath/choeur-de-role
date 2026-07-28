import { test, expect } from '@playwright/test';
import { createTestMember, deleteTestMember } from './helpers/supabase';

const TEST_EMAIL = `test-inscription-${Date.now()}@e2e.local`;
const TEST_PASSWORD = 'PassphraseTest-E2E!99';

let testUserId: string;

test.beforeAll(async () => {
  testUserId = await createTestMember({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'Inscription',
  });
});

test.afterAll(async () => {
  if (testUserId) await deleteTestMember(testUserId);
});

test.describe('Création de compte — connexion du nouveau membre', () => {
  test('connexion avec les credentials de création redirige vers /choristes', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/choristes/, { timeout: 15_000 });
  });

  test('la zone choristes est accessible après connexion', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL(/\/choristes/, { timeout: 15_000 });
    // La page choristes doit s'afficher (pas de redirection vers /login)
    await expect(page).not.toHaveURL(/\/login/);
    // Le bouton de déconnexion est présent → session bien établie
    await expect(page.getByRole('button', { name: /déconnecter/i })).toBeVisible();
  });

  test('mot de passe incorrect affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(
      page.locator('p').filter({ hasText: 'Email ou mot de passe incorrect' }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL('/login');
  });

  test('email inexistant affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('inexistant@nowhere.test');
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(
      page.locator('p').filter({ hasText: 'Email ou mot de passe incorrect' }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('compte non confirmé ne peut pas accéder à /choristes', async ({ page }) => {
    // Sans session valide, /choristes doit rediriger vers /login
    await page.goto('/choristes');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
