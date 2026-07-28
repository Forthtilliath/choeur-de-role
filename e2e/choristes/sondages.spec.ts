import { test, expect } from '@playwright/test';

test.describe('Page Sondages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes/sondages');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('des sondages sont affichés ou un message vide est présent', async ({ page }) => {
    const polls = page.locator('.border.border-border.rounded-2xl');
    const count = await polls.count();

    if (count === 0) {
      await expect(page.locator('text=Aucun sondage actif pour le moment')).toBeVisible();
    } else {
      await expect(polls.first()).toBeVisible();
    }
  });

  test('les sondages en attente sont séparés des sondages répondus', async ({ page }) => {
    const polls = page.locator('.border.border-border.rounded-2xl');
    if ((await polls.count()) === 0) {
      test.skip(true, 'Aucun sondage disponible — test non pertinent');
      return;
    }

    // Les deux sections existent si des sondages existent dans les deux états
    const headers = page.locator('h2').filter({ hasText: /En attente|Déjà répondus/ });
    // Au moins une section doit être visible
    await expect(headers.first()).toBeVisible();
  });

  test('un sondage ouvert possède un bouton Répondre', async ({ page }) => {
    const repondreBtn = page.getByRole('button', { name: 'Répondre' });
    if ((await repondreBtn.count()) === 0) {
      test.skip(true, 'Aucun sondage en attente — test non pertinent');
      return;
    }
    await expect(repondreBtn.first()).toBeVisible();
  });

  test('cliquer sur Répondre ouvre le formulaire de réponse', async ({ page }) => {
    const repondreBtn = page.getByRole('button', { name: 'Répondre' });
    if ((await repondreBtn.count()) === 0) {
      test.skip(true, 'Aucun sondage en attente — test non pertinent');
      return;
    }

    await repondreBtn.first().click();
    // Le formulaire de réponse s'affiche (PollAnswerClient)
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible({ timeout: 5_000 });
  });

  test('le formulaire de réponse contient le bouton Soumettre et Annuler', async ({ page }) => {
    const repondreBtn = page.getByRole('button', { name: 'Répondre' });
    if ((await repondreBtn.count()) === 0) {
      test.skip(true, 'Aucun sondage en attente — test non pertinent');
      return;
    }
    await repondreBtn.first().click();
    await expect(page.getByRole('button', { name: /Soumettre mes réponses/i })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
  });

  test('Annuler depuis le formulaire ferme sans soumettre', async ({ page }) => {
    const repondreBtn = page.getByRole('button', { name: 'Répondre' });
    if ((await repondreBtn.count()) === 0) {
      test.skip(true, 'Aucun sondage en attente — test non pertinent');
      return;
    }
    await repondreBtn.first().click();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    // Retour à la liste : le bouton Répondre réapparaît
    await expect(page.getByRole('button', { name: 'Répondre' }).first()).toBeVisible({ timeout: 3_000 });
  });
});

test.describe('Page Sondages - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes/sondages');
    await expect(page.locator('main h1')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin/sondages"]')).toBeVisible();
  });
});
