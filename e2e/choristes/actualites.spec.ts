import { test, expect } from '@playwright/test';

test.describe('Page Actualités', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/choristes');
    await expect(page).toHaveURL('/choristes', { timeout: 15_000 });
  });

  test('la page se charge pour un membre connecté', async ({ page }) => {
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/error/);
  });

  test('le panneau admin n\'est pas visible pour un membre', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Administration"]')).not.toBeAttached();
  });

  test('les actualités épinglées apparaissent avant les autres', async ({ page }) => {
    await page.waitForSelector('[id^="news-"]', { timeout: 10_000 }).catch(() => null);

    const allCards = page.locator('[id^="news-"]');
    const count = await allCards.count();
    if (count === 0) {
      test.skip(true, 'Aucune actualité disponible');
      return;
    }

    const pinnedCount = await page.locator('p:text("📌 Épinglée")').count();
    if (pinnedCount === 0) {
      test.skip(true, 'Aucune actualité épinglée — test non pertinent');
      return;
    }

    const cards = await allCards.all();
    let lastPinnedIndex = -1;
    let firstUnpinnedIndex = -1;

    for (let i = 0; i < cards.length; i++) {
      const isPinned = (await cards[i].locator('p:text("📌 Épinglée")').count()) > 0;
      if (isPinned) lastPinnedIndex = i;
      else if (firstUnpinnedIndex === -1) firstUnpinnedIndex = i;
    }

    if (firstUnpinnedIndex !== -1 && lastPinnedIndex !== -1) {
      expect(lastPinnedIndex).toBeLessThan(firstUnpinnedIndex);
    }
  });

  test('les actualités épinglées ont la bordure primary', async ({ page }) => {
    await page.waitForSelector('[id^="news-"]', { timeout: 10_000 }).catch(() => null);

    const pinnedBadges = page.locator('p:text("📌 Épinglée")');
    const pinnedCount = await pinnedBadges.count();
    if (pinnedCount === 0) {
      test.skip(true, 'Aucune actualité épinglée — test non pertinent');
      return;
    }

    // Structure : p → div.bg-primary/10 → div#news-X.border-primary (2 niveaux)
    for (let i = 0; i < pinnedCount; i++) {
      const card = pinnedBadges.nth(i).locator('xpath=../..');
      await expect(card).toHaveClass(/border-primary/);
    }
  });
});

test.describe('Page Actualités - visibilité admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('le panneau admin est visible pour un admin', async ({ page }) => {
    await page.goto('/choristes');
    await expect(page).toHaveURL('/choristes', { timeout: 15_000 });
    await expect(page.locator('nav[aria-label="Administration"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Administration"] a[href="/choristes/admin"]')).toBeVisible();
  });
});
