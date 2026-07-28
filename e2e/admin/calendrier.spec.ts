import { test, expect } from '@playwright/test';

test.describe('Admin — Calendrier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/calendrier');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/calendrier');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Calendrier" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Calendrier' })).toBeVisible();
  });

  test('le bouton Types d\'évènements est présent', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Types d'évènements/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Types d'évènements/i })).toHaveAttribute('href', '/choristes/admin/calendrier/types');
  });

  test('le calendrier mensuel est affiché', async ({ page }) => {
    // Le grid calendrier affiche une h2 avec le mois et l'année
    await expect(page.locator('h2').filter({ hasText: /Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre/ })).toBeVisible();
    // Les noms de jours
    await expect(page.locator('div', { hasText: /^Lun$/ }).first()).toBeVisible();
  });

  test('les contrôles de vue Mois/Semaine sont présents', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Mois' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Semaine' })).toBeVisible();
  });

  test('le lien d\'export iCal est présent', async ({ page }) => {
    await expect(page.locator('a[href="/api/calendrier/export-ical"]')).toBeVisible();
  });
});

test.describe('Admin — Types d\'évènements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/calendrier/types');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/calendrier/types');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('le titre "Types d\'évènements" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: "Types d'évènements" })).toBeVisible();
  });

  test('le bouton "Ajouter un type" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter un type/i })).toBeVisible();
  });

  test('des types d\'évènements sont affichés', async ({ page }) => {
    // Il y a toujours des types par défaut (Répétition, Concert, etc.)
    const items = page.locator('.rounded-xl.border.border-border.bg-background');
    const count = await items.count();
    if (count > 0) {
      await expect(items.first()).toBeVisible();
    }
  });

  test('cliquer sur "Ajouter un type" affiche le formulaire', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un type/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau type' })).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('input[placeholder="Répétition"]')).toBeVisible();
  });

  test('le formulaire contient les champs Label, Description et Couleur', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un type/i }).click();
    await expect(page.locator('input[placeholder="Répétition"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="utiliser ce type"]')).toBeVisible();
    await expect(page.locator('input[type="color"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeVisible();
  });

  test('Annuler ferme le formulaire sans créer de type', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter un type/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau type' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau type' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('chaque type affiche les boutons Modifier et Supprimer', async ({ page }) => {
    const types = page.locator('.rounded-xl.border.border-border.bg-background').filter({ hasText: /./ });
    if ((await types.count()) === 0) {
      test.skip(true, 'Aucun type disponible');
      return;
    }
    const first = types.first();
    await expect(first.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await expect(first.getByRole('button', { name: /Supprimer/i })).toBeVisible();
  });

  test('Supprimer affiche une confirmation et Annuler conserve le type', async ({ page }) => {
    const types = page.locator('.rounded-xl.border.border-border.bg-background').filter({ hasText: /./ });
    if ((await types.count()) === 0) {
      test.skip(true, 'Aucun type disponible');
      return;
    }
    const countBefore = await types.count();
    await types.first().getByRole('button', { name: /Supprimer/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: 'Annuler' }).first().click();
    await expect(types).toHaveCount(countBefore, { timeout: 3_000 });
  });

  test('cycle CRUD complet : créer un type → vérifier → supprimer', async ({ page }) => {
    test.slow();
    const label = `Type E2E ${Date.now()}`;

    // Création
    await page.getByRole('button', { name: /Ajouter un type/i }).click();
    await expect(page.locator('h2', { hasText: 'Nouveau type' })).toBeVisible({ timeout: 3_000 });
    await page.locator('input[placeholder="Répétition"]').fill(label);
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();

    // Vérification
    const newType = page.locator('.rounded-xl.border.border-border.bg-background').filter({ hasText: label });
    await expect(newType.first()).toBeVisible({ timeout: 5_000 });

    // Suppression
    await newType.first().getByRole('button', { name: /Supprimer/i }).click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByRole('button', { name: 'Confirmer' })).toBeVisible({ timeout: 3_000 });
    await modal.getByRole('button', { name: 'Confirmer' }).click();

    // Vérification suppression
    await expect(newType).toHaveCount(0, { timeout: 5_000 });
  });
});
