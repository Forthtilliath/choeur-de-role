import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Authentification', () => {
  test('connexion valide redirige vers la zone choristes', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL(/\/choristes/, { timeout: 15_000 });
  });

  test('mauvais identifiants affichent le message d\'erreur', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('aucun@exemple.com', 'mauvaisMotDePasse');
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL('/login');
  });

  test('le bouton se désactive pendant la connexion', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.locator('input[name="email"]').fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[name="password"]').fill(process.env.TEST_USER_PASSWORD!);
    // Ne pas attendre la redirection — vérifier l'état de chargement
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByRole('button', { name: /Connexion/ })).toBeDisabled();
  });

  test('/choristes sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/repertoire sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/repertoire');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/admin/mediatheque sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/admin/mediatheque');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/calendrier sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/calendrier');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/admin/membres sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/admin/membres');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/admin/concerts sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/admin/concerts');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/choristes/profil sans session redirige vers /login', async ({ page }) => {
    await page.goto('/choristes/profil');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
