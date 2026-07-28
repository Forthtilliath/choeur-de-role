import { test, expect } from '@playwright/test';
import { RepertoirePage } from './pages/repertoire.page';

test.describe('Répertoire choriste', () => {
  test('la page se charge et affiche le titre principal', async ({ page }) => {
    const repertoire = new RepertoirePage(page);
    await repertoire.goto();
    await expect(page).toHaveURL('/choristes/repertoire');
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('la recherche filtre les chants et peut être réinitialisée', async ({ page }) => {
    const repertoire = new RepertoirePage(page);
    await repertoire.goto();

    const count = await repertoire.songCards.count();
    if (count === 0) test.skip(true, 'Aucun chant dans la base de données');

    // Recherche sans résultat
    await repertoire.searchFor('xxxxxx_chant_inexistant_xxxxxx');
    await expect(repertoire.songCards).toHaveCount(0);

    // Effacement → liste complète restaurée
    await repertoire.clearSearch();
    await expect(repertoire.songCards).toHaveCount(count);
  });

  test('le filtre pupitre "Tous" est accessible et sélectionnable', async ({ page }) => {
    const repertoire = new RepertoirePage(page);
    await repertoire.goto();

    const tousBtn = repertoire.voicePartButton('Tous');
    await expect(tousBtn).toBeVisible();
    await tousBtn.click();
    await expect(tousBtn).toHaveClass(/border-primary/);
  });

  test('cliquer sur un fichier non-audio appelle /api/repertoire/signed-url', async ({ page }) => {
    // Intercepter AVANT la navigation pour capturer les requêtes de la page
    let signedUrlCalled = false;
    await page.route('**/api/repertoire/signed-url**', async (route) => {
      signedUrlCalled = true;
      await route.fulfill({ json: { url: 'https://example.com/fichier-test.pdf' } });
    });

    const repertoire = new RepertoirePage(page);
    await repertoire.goto();

    const openBtn = repertoire.openFileButtons.first();
    if ((await openBtn.count()) === 0) {
      test.skip(true, 'Aucun fichier non-audio visible dans le répertoire');
    }

    await expect(openBtn).toBeEnabled();
    await openBtn.click();

    // Attendre que le bouton repasse à l'état actif (fin du chargement)
    await expect(openBtn).toBeEnabled({ timeout: 8_000 });
    expect(signedUrlCalled).toBe(true);
  });

  test('le bouton Lecture est visible pour les fichiers audio', async ({ page }) => {
    // Intercepter pour éviter une vraie requête R2
    await page.route('**/api/repertoire/signed-url**', async (route) => {
      await route.fulfill({ json: { url: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAA==' } });
    });

    const repertoire = new RepertoirePage(page);
    await repertoire.goto();

    const playBtn = repertoire.audioPlayButtons.first();
    if ((await playBtn.count()) === 0) {
      test.skip(true, 'Aucun fichier audio visible dans le répertoire');
    }

    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeEnabled();
  });
});
