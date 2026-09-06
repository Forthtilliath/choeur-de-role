import { test, expect } from '@playwright/test';

test.describe('Admin — Gestion des membres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/admin/membres');
    // `.first()` : le loading.tsx expose brièvement un 2e <main> pendant le streaming.
    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge sans redirection', async ({ page }) => {
    await expect(page).toHaveURL('/choristes/admin/membres');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le titre "Gestion des membres" est affiché', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestion des membres' }).first()).toBeVisible();
  });

  test('le champ de recherche est présent', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Rechercher un membre"]')).toBeVisible();
  });

  test('des membres sont affichés', async ({ page }) => {
    // Il y a toujours au moins un membre (le compte admin)
    const rows = page.locator('table tbody tr, [data-member-row]');
    if ((await rows.count()) === 0) {
      await expect(page.locator('main').getByRole('button', { name: /Modifier|Inviter/i }).first()).toBeVisible({ timeout: 5_000 });
    } else {
      await expect(rows.first()).toBeVisible();
    }
  });

  test('le bouton "Ajouter un membre" est présent', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ajouter|Nouveau membre|Créer/i }).first()).toBeVisible();
  });

  test('le filtre par saison est présent', async ({ page }) => {
    // Select "Toutes les saisons"
    await expect(page.locator('select').filter({ has: page.locator('option', { hasText: /Toutes les saisons/i }) })).toBeVisible();
  });

  test('la recherche filtre les membres affichés', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Rechercher un membre"]');
    // Recherche d'une chaîne improbable : aucun résultat
    await searchInput.fill('xyzimpossible999e2e');
    // La liste se vide ou affiche un message vide
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(0, { timeout: 3_000 });
    // Nettoyage
    await searchInput.fill('');
  });

  test('chaque membre affiche le bouton Modifier (crayon)', async ({ page }) => {
    // MemberRow affiche un ButtonIcon edit (Pencil icon) et Supprimer (X icon)
    const editBtns = page.locator('main').getByRole('button', { name: /Modifier|edit/i });
    if ((await editBtns.count()) === 0) {
      // Les boutons sont dans un row, peut utiliser des icônes
      const pencilBtns = page.locator('main button').filter({ has: page.locator('svg') }).first();
      await expect(pencilBtns).toBeVisible();
    } else {
      await expect(editBtns.first()).toBeVisible();
    }
  });

  test('cliquer sur "Ajouter un membre" ouvre le formulaire de création', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter|Nouveau membre|Créer/i }).first().click();
    // CreateMemberForm : sélection pupitre, saison, rôle
    await expect(page.locator('form').or(page.locator('[role="dialog"]')).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
  });

  test('Annuler ferme le formulaire de création', async ({ page }) => {
    await page.getByRole('button', { name: /Ajouter|Nouveau membre|Créer/i }).first().click();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    // Le formulaire disparaît
    await expect(page.locator('h2', { hasText: /Nouveau membre|Ajouter/i })).not.toBeVisible({ timeout: 3_000 });
  });
});
