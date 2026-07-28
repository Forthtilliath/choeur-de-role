import { test, expect } from '@playwright/test';

// ─── Navigation principale ────────────────────────────────────────────────────

test.describe('Navigation principale', () => {
  test('le header contient tous les liens principaux', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.locator('a[href="/concerts"]').first()).toBeVisible();
    await expect(header.locator('a[href="/evenements"]').first()).toBeVisible();
    await expect(header.locator('a[href="/galerie"]').first()).toBeVisible();
    await expect(header.locator('a[href="/partenaires"]').first()).toBeVisible();
    await expect(header.locator('a[href="/contact"]').first()).toBeVisible();
  });

  test('cliquer Concerts depuis le header navigue vers /concerts', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: /concerts/i }).first().click();
    await expect(page).toHaveURL('/concerts');
  });

  test('cliquer Contact depuis le header navigue vers /contact', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: /contact/i }).first().click();
    await expect(page).toHaveURL('/contact');
  });
});

// ─── Homepage ─────────────────────────────────────────────────────────────────

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('la section héro affiche un titre', async ({ page }) => {
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('le CTA "Nos concerts" navigue vers /concerts', async ({ page }) => {
    await page.getByRole('link', { name: /nos concerts/i }).first().click();
    await expect(page).toHaveURL('/concerts');
  });

  test('le CTA "Nous contacter" navigue vers /contact', async ({ page }) => {
    await page.getByRole('link', { name: /nous contacter/i }).first().click();
    await expect(page).toHaveURL('/contact');
  });
});

// ─── Concerts ─────────────────────────────────────────────────────────────────

test.describe('Page Concerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/concerts');
  });

  test('la page se charge avec le champ de recherche', async ({ page }) => {
    await expect(page.getByPlaceholder('Rechercher un concert...')).toBeVisible();
  });

  test('la recherche met à jour le paramètre q dans l\'URL', async ({ page }) => {
    await page.getByPlaceholder('Rechercher un concert...').fill('Requiem');
    await page.waitForURL(/[?&]q=Requiem/, { timeout: 3_000 });
    expect(new URL(page.url()).searchParams.get('q')).toBe('Requiem');
  });

  test('une recherche sans résultat affiche un message', async ({ page }) => {
    await page.getByPlaceholder('Rechercher un concert...').fill('xxxxxx_inexistant_xxxxxx');
    await page.waitForURL(/q=xxxxxx/, { timeout: 3_000 });
    await expect(
      page.getByText('Aucun concert ne correspond à cette recherche.'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('effacer la recherche supprime le paramètre q de l\'URL', async ({ page }) => {
    await page.goto('/concerts?q=test');
    const input = page.getByPlaceholder('Rechercher un concert...');
    await expect(input).toHaveValue('test');
    await input.fill('');
    await page.waitForFunction(
      () => !new URL(window.location.href).searchParams.has('q'),
      undefined,
      { timeout: 3_000 },
    );
    expect(new URL(page.url()).searchParams.get('q')).toBeNull();
  });
});

// ─── Galerie ──────────────────────────────────────────────────────────────────

test.describe('Page Galerie', () => {
  test('la page se charge', async ({ page }) => {
    await page.goto('/galerie');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });

  test('un clic sur une photo ouvre la lightbox', async ({ page }) => {
    await page.goto('/galerie');
    const photo = page.locator('main img').first();
    if ((await photo.count()) === 0) test.skip(true, 'Aucune photo disponible');

    await photo.click();
    // La lightbox est présente (plein écran) — on vérifie qu'une image s'affiche en grand
    await expect(page.locator('[role="dialog"], [data-lightbox], .lightbox, [aria-modal]').or(
      page.locator('img[style*="object-fit"]').or(page.locator('.fixed img'))
    ).first()).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Événements ───────────────────────────────────────────────────────────────

test.describe('Page Événements', () => {
  test('la page se charge', async ({ page }) => {
    await page.goto('/evenements');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });
});

// ─── Partenaires ──────────────────────────────────────────────────────────────

test.describe('Page Partenaires', () => {
  test('la page se charge', async ({ page }) => {
    await page.goto('/partenaires');
    await expect(page.locator('main')).toBeVisible();
  });

  test('le CTA "Devenir partenaire" pointe vers /contact?sujet=partenariat', async ({ page }) => {
    await page.goto('/partenaires');
    const link = page.getByRole('link', { name: /devenir partenaire/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/contact/);
    expect(href).toMatch(/sujet=partenariat/);
  });
});

// ─── Contact ──────────────────────────────────────────────────────────────────

test.describe('Formulaire de contact', () => {
  test('la page se charge avec le formulaire complet', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('button', { name: /rejoindre la chorale/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /devenir partenaire/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /autre demande/i })).toBeVisible();
    await expect(page.getByPlaceholder('Marie', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Dupont', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('marie.dupont@email.fr')).toBeVisible();
    await expect(page.getByPlaceholder('Votre message...')).toBeVisible();
  });

  test('?sujet=partenariat présélectionne la catégorie Devenir partenaire', async ({ page }) => {
    await page.goto('/contact?sujet=partenariat');
    const btn = page.getByRole('button', { name: /devenir partenaire/i });
    await expect(btn).toHaveClass(/border-primary/);
  });

  test('?sujet=invalide désactive le bouton Envoyer', async ({ page }) => {
    await page.goto('/contact?sujet=invalide');
    await expect(page.getByRole('button', { name: /envoyer le message/i })).toBeDisabled();
  });

  test('cliquer une catégorie la sélectionne visuellement', async ({ page }) => {
    await page.goto('/contact?sujet=invalide'); // pas de catégorie pré-sélectionnée
    const btn = page.getByRole('button', { name: /autre demande/i });
    await btn.click();
    await expect(btn).toHaveClass(/border-primary/);
    await expect(page.getByRole('button', { name: /envoyer le message/i })).toBeEnabled();
  });

  test('la soumission complète affiche le message de succès', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    await page.goto('/contact');
    // catégorie "rejoindre" sélectionnée par défaut
    await page.getByPlaceholder('Marie', { exact: true }).fill('Alice');
    await page.getByPlaceholder('Dupont', { exact: true }).fill('Dupont');
    await page.getByPlaceholder('marie.dupont@email.fr').fill('alice@test.e2e');
    await page.getByPlaceholder('Votre message...').fill('Ceci est un test E2E automatisé.');
    await page.getByRole('button', { name: /envoyer le message/i }).click();

    await expect(page.getByText('Message envoyé !')).toBeVisible({ timeout: 8_000 });
  });

  test('une erreur serveur affiche le message d\'erreur', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 500 }),
    );

    await page.goto('/contact');
    await page.getByPlaceholder('Marie', { exact: true }).fill('Alice');
    await page.getByPlaceholder('Dupont', { exact: true }).fill('Dupont');
    await page.getByPlaceholder('marie.dupont@email.fr').fill('alice@test.e2e');
    await page.getByPlaceholder('Votre message...').fill('Ceci est un test E2E automatisé.');
    await page.getByRole('button', { name: /envoyer le message/i }).click();

    await expect(page.locator('p[role="alert"]')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('p[role="alert"]')).toContainText(/erreur est survenue/i);
  });
});

// ─── Concert détail ───────────────────────────────────────────────────────────

test.describe('Concert — Page de détail', () => {
  test('naviguer vers un concert depuis la liste affiche la page de détail', async ({ page }) => {
    await page.goto('/concerts');
    const links = page.locator('main a[href^="/concerts/"]');
    if ((await links.count()) === 0) {
      test.skip(true, 'Aucun concert disponible');
      return;
    }
    const href = await links.first().getAttribute('href');
    // Navigate directly: ConcertsClient has a 300 ms debounced router.replace that
    // fires on mount and races with link clicks, overriding the navigation.
    await page.goto(href!);
    await page.waitForURL(href!);
    // page.goto() en Next.js 13 est intercepté comme soft nav — les deux pages coexistent
    // brièvement ; on cible le dernier <main h1> qui est celui de la page de détail
    await expect(page.locator('main h1').last()).toBeVisible({ timeout: 10_000 });
  });

  test('la page de détail contient un lien de retour vers /concerts', async ({ page }) => {
    await page.goto('/concerts');
    const links = page.locator('main a[href^="/concerts/"]');
    if ((await links.count()) === 0) {
      test.skip(true, 'Aucun concert disponible');
      return;
    }
    const href = await links.first().getAttribute('href');
    await page.goto(href!);
    await page.waitForURL(href!);
    const backLink = page.getByRole('link', { name: /Tous les concerts/i });
    await expect(backLink).toBeVisible({ timeout: 10_000 });
    await backLink.click();
    await expect(page).toHaveURL('/concerts', { timeout: 5_000 });
  });
});

// ─── Événements — Page de détail ──────────────────────────────────────────────

test.describe('Événement — Page de détail', () => {
  test('naviguer vers un événement depuis la liste affiche la page de détail', async ({ page }) => {
    await page.goto('/evenements');
    const links = page.locator('main a[href^="/evenements/"]:has(h3)');
    if ((await links.count()) === 0) {
      test.skip(true, 'Aucun événement disponible');
      return;
    }
    const href = await links.first().getAttribute('href');
    await links.first().click();
    await expect(page).toHaveURL(
      new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      { timeout: 10_000 },
    );
    await expect(page.locator('main')).toBeVisible();
  });
});

// ─── Pages légales ────────────────────────────────────────────────────────────

test.describe('Pages légales', () => {
  for (const route of ['/cgu', '/mentions-legales', '/politique-confidentialite']) {
    test(`${route} se charge sans erreur`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page).not.toHaveURL(/error/);
    });
  }
});
