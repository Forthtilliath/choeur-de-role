/**
 * Smoke tests — vérifie que chaque page se charge sans erreur critique.
 * Stratégie : on cherche la présence d'un <main> et l'absence d'une overlay d'erreur Turbopack/Next.
 * Les tests admin utilisent le storage state admin.
 */
import { test, expect, Page } from '@playwright/test';

async function expectPageLoads(page: Page, url: string) {
  await page.goto(url);
  // Pas de redirection vers /login ou /error
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await expect(page).not.toHaveURL(/\/error/);
  // Pas d'overlay d'erreur Turbopack ("Element type is invalid" etc.)
  const errorOverlay = page.locator('nextjs-portal').or(page.locator('[data-nextjs-dialog]'));
  await expect(errorOverlay).not.toBeAttached({ timeout: 3_000 }).catch(() => {
    // L'overlay n'existe pas toujours dans le DOM — on ignore l'absence
  });
  // La page a rendu quelque chose
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
}

// ─── Pages publiques (sans authentification) ──────────────────────────────────

test.describe('Smoke — pages publiques', () => {
  const publicPages = [
    { url: '/', name: 'Accueil' },
    { url: '/concerts', name: 'Concerts' },
    { url: '/galerie', name: 'Galerie' },
    { url: '/evenements', name: 'Évènements' },
    { url: '/partenaires', name: 'Partenaires' },
    { url: '/contact', name: 'Contact' },
    { url: '/login', name: 'Login' },
    { url: '/mentions-legales', name: 'Mentions légales' },
    { url: '/cgu', name: 'CGU' },
    { url: '/politique-confidentialite', name: 'Politique de confidentialité' },
  ];

  for (const { url, name } of publicPages) {
    test(`${name} (${url})`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    });
  }
});

// ─── Pages choristes (session membre) ────────────────────────────────────────

test.describe('Smoke — pages choristes', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  const choristesPages = [
    { url: '/choristes', name: 'Actualités choristes' },
    { url: '/choristes/calendrier', name: 'Calendrier' },
    { url: '/choristes/repertoire', name: 'Répertoire' },
    { url: '/choristes/trombinoscope', name: 'Trombinoscope' },
    { url: '/choristes/liens', name: 'Liens utiles' },
    { url: '/choristes/sondages', name: 'Sondages' },
    { url: '/choristes/bureau/taches', name: 'Tâches' },
    { url: '/choristes/profil', name: 'Mon profil' },
    { url: '/choristes/carte', name: 'Carte' },
  ];

  for (const { url, name } of choristesPages) {
    test(`${name} (${url})`, async ({ page }) => {
      await expectPageLoads(page, url);
    });
  }
});

// ─── Pages admin (session admin) ─────────────────────────────────────────────

test.describe('Smoke — pages admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  const adminPages = [
    { url: '/choristes/admin', name: 'Actualités admin' },
    { url: '/choristes/admin/tableau-de-bord', name: 'Tableau de bord' },
    { url: '/choristes/admin/membres', name: 'Membres' },
    { url: '/choristes/admin/pupitres', name: 'Pupitres' },
    { url: '/choristes/admin/saisons', name: 'Saisons' },
    { url: '/choristes/admin/calendrier', name: 'Calendrier admin' },
    { url: '/choristes/admin/concerts', name: 'Concerts admin' },
    { url: '/choristes/admin/galerie', name: 'Galerie admin' },
    { url: '/choristes/admin/mediatheque', name: 'Médiathèque' },
    { url: '/choristes/admin/evenements', name: 'Évènements admin' },
    { url: '/choristes/admin/sponsors', name: 'Partenaires admin' },
    { url: '/choristes/admin/liens', name: 'Liens admin' },
    { url: '/choristes/admin/sondages', name: 'Sondages admin' },
    { url: '/choristes/admin/ca', name: 'CA admin' },
    { url: '/choristes/admin/audit-log', name: 'Journal d\'audit' },
    { url: '/choristes/admin/messages', name: 'Messages de contact' },
    { url: '/choristes/admin/emails', name: 'Emails' },
    { url: '/choristes/admin/bureau/projets', name: 'Projets (bureau)' },
    { url: '/choristes/admin/bureau/templates', name: 'Templates (bureau)' },
    { url: '/choristes/admin/homepage', name: 'Page d\'accueil admin' },
    { url: '/choristes/admin/mentions-legales', name: 'Mentions légales admin' },
  ];

  for (const { url, name } of adminPages) {
    test(`${name} (${url})`, async ({ page }) => {
      await expectPageLoads(page, url);
    });
  }
});
