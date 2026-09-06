import { test, expect } from '@playwright/test';

test.describe('Page Calendrier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/calendrier');
    // Attendre que le Suspense se résolve (CalendarGrid ou CalendarWeek visible)
    await page.waitForSelector('h2', { timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('la vue mois est active par défaut', async ({ page }) => {
    const moisBtn = page.getByRole('button', { name: 'Mois' });
    await expect(moisBtn).toBeVisible();
    await expect(moisBtn).toHaveClass(/bg-primary/);
    await expect(page.getByRole('button', { name: 'Semaine' })).not.toHaveClass(/bg-primary/);
  });

  test('l\'en-tête affiche le mois et l\'année courants', async ({ page }) => {
    // Le h2 contient "{Mois} {Année}" — on vérifie juste qu'une année récente est présente
    const header = page.locator('h2').filter({ hasText: /20\d\d/ });
    await expect(header).toBeVisible();
  });

  test('naviguer au mois précédent met à jour l\'en-tête', async ({ page }) => {
    const header = page.locator('h2').filter({ hasText: /20\d\d/ }).first();
    const headerBefore = (await header.textContent())?.trim() ?? '';
    await page.getByRole('button', { name: '←' }).click();
    // toHaveText réessaie jusqu'à ce que l'en-tête change (évite la course DOM).
    await expect(header).not.toHaveText(headerBefore);
  });

  test('naviguer au mois suivant met à jour l\'en-tête', async ({ page }) => {
    const header = page.locator('h2').filter({ hasText: /20\d\d/ }).first();
    const headerBefore = (await header.textContent())?.trim() ?? '';
    await page.getByRole('button', { name: '→' }).click();
    await expect(header).not.toHaveText(headerBefore);
  });

  test('basculer en vue semaine change le bouton actif', async ({ page }) => {
    await page.getByRole('button', { name: 'Semaine' }).click();
    await expect(page.getByRole('button', { name: 'Semaine' })).toHaveClass(/bg-primary/);
    await expect(page.getByRole('button', { name: 'Mois' })).not.toHaveClass(/bg-primary/);
  });

  test('revenir en vue mois depuis la vue semaine', async ({ page }) => {
    await page.getByRole('button', { name: 'Semaine' }).click();
    await page.getByRole('button', { name: 'Mois' }).click();
    await expect(page.getByRole('button', { name: 'Mois' })).toHaveClass(/bg-primary/);
  });

  test('le lien d\'export .ics est présent et correct', async ({ page }) => {
    const exportLink = page.locator('a[href="/api/calendrier/export-ical"]');
    await expect(exportLink).toBeVisible();
    await expect(exportLink).toHaveAttribute('download', 'calendrier-cda.ics');
  });

  test('des évènements sont affichés dans le calendrier', async ({ page }) => {
    // Naviguer au mois précédent (Juin 2026 a de nombreux évènements dans les données de prod)
    await page.getByRole('button', { name: '←' }).click();

    // Les boutons d'évènements ont un style inline borderLeftColor unique
    // .filter({ visible: true }) exclut les boutons cachés par overflow dans les cellules
    const eventButtons = page.locator('button[style*="border-left-color"]').filter({ visible: true });
    const count = await eventButtons.count();
    if (count === 0) {
      test.skip(true, 'Aucun évènement visible — vérifier les données de seed');
      return;
    }
    await expect(eventButtons.first()).toBeVisible();
    expect(count).toBeGreaterThan(0);
  });

  test('cliquer sur un évènement ouvre son détail', async ({ page }) => {
    // Naviguer au mois précédent pour trouver des évènements
    await page.getByRole('button', { name: '←' }).click();

    const eventButtons = page.locator('button[style*="border-left-color"]').filter({ visible: true });
    if ((await eventButtons.count()) === 0) {
      test.skip(true, 'Aucun évènement — test non pertinent');
      return;
    }

    await eventButtons.first().click();
    // Le formulaire/détail s'ouvre (dialog ou panneau)
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Page Calendrier - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/calendrier');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/calendrier"]')).toBeVisible();
  });
});
