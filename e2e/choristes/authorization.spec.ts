import { test, expect } from '@playwright/test';

// Ce fichier tourne dans le projet "choriste" (user.json) — rôle member.
// Un membre ne doit PAS pouvoir accéder aux pages /choristes/admin/*.

const adminPages = [
  '/choristes/admin',
  '/choristes/admin/membres',
  '/choristes/admin/concerts',
  '/choristes/admin/galerie',
  '/choristes/admin/mediatheque',
  '/choristes/admin/evenements',
  '/choristes/admin/sondages',
  '/choristes/admin/liens',
  '/choristes/admin/messages',
  '/choristes/admin/sponsors',
  '/choristes/admin/pupitres',
  '/choristes/admin/tableau-de-bord',
  '/choristes/admin/calendrier',
  '/choristes/admin/ca',
  '/choristes/admin/audit-log',
];

test.describe('Protection des routes admin — vue choriste', () => {
  for (const url of adminPages) {
    test(`${url} redirige un choriste vers /choristes`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveURL(/\/choristes(?!\/admin)/, { timeout: 10_000 });
      await expect(page).not.toHaveURL(/\/admin/);
    });
  }
});
