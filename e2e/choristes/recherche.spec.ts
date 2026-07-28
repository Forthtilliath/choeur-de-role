import { test, expect } from '@playwright/test';

// La palette de recherche (Ctrl+K) est accessible depuis toutes les pages choristes

test.describe('Recherche globale (CommandPalette)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('s\'ouvre avec Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('input[placeholder*="Rechercher"]').last()).toBeVisible({ timeout: 6_000 });
  });

  test('s\'ouvre via le bouton dans le header', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label*="Recherche"]').first();
    await searchBtn.click();
    await expect(page.locator('input[placeholder*="Rechercher"]').last()).toBeVisible({ timeout: 6_000 });
  });

  test('se ferme avec Escape', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible({ timeout: 6_000 });
  });

  test('se ferme en cliquant sur l\'overlay', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    // Cliquer en dehors du panneau (sur l'overlay)
    await page.mouse.click(10, 10);
    await expect(searchInput).not.toBeVisible({ timeout: 6_000 });
  });

  test('affiche des résultats pour une query connue', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    // "Calendrier" apparaît dans les nav items statiques (privateNavItems)
    await searchInput.fill('Calendrier');
    await expect(page.locator('text=Calendrier').last()).toBeVisible({ timeout: 2_000 });
  });

  test('affiche "Aucun résultat" pour une query introuvable', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    await searchInput.fill('xyzimpossible123');
    await expect(page.locator('text=Aucun résultat')).toBeVisible({ timeout: 2_000 });
  });

  test('les groupes de résultats sont affichés', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    // "Concerts" apparaît dans deux groupes (Pages + éventuellement résultats dynamiques)
    await searchInput.fill('Concerts');
    // Un label de groupe doit apparaître
    const group = page.locator('p.text-\\[10px\\]').filter({ hasText: /Pages|Administration/ });
    await expect(group.first()).toBeVisible({ timeout: 2_000 });
  });

  test('la navigation clavier fonctionne', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Rechercher"]').last();
    await expect(searchInput).toBeVisible({ timeout: 6_000 });

    await searchInput.fill('Calendrier');
    // Attendre les résultats
    await expect(page.locator('text=Calendrier').last()).toBeVisible({ timeout: 2_000 });

    // Flèche bas → l'item actif affiche l'indicateur ↵
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('kbd', { hasText: '↵' }).first()).toBeVisible({ timeout: 1_000 });
  });
});
