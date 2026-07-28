import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('connexion membre', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Proxy all Supabase calls through Node.js to avoid browser CORS restrictions
  // (cross-port: localhost:3000 → localhost:54321).
  await page.route(`${supabaseUrl}/**`, async (route) => {
    const req = route.request();
    try {
      const resp = await fetch(req.url(), {
        method: req.method(),
        headers: Object.fromEntries(
          (await req.headersArray())
            .filter(({ name }) => !['host', 'content-length'].includes(name.toLowerCase()))
            .map(({ name, value }) => [name, value]),
        ),
        body: !['GET', 'HEAD'].includes(req.method())
          ? (req.postDataBuffer() ?? undefined) as BodyInit | undefined
          : undefined,
      });
      const body = Buffer.from(await resp.arrayBuffer());
      const headers: Record<string, string> = {};
      resp.headers.forEach((v, k) => { headers[k] = v; });
      headers['access-control-allow-origin'] = 'http://localhost:3000';
      headers['access-control-allow-credentials'] = 'true';
      await route.fulfill({ status: resp.status, headers, body });
    } catch (e) {
      console.error('[PROXY ERROR]', req.method(), req.url(), e);
      await route.abort('failed');
    }
  });

  await page.goto('/login');
  await page.locator('input[name="email"]').fill(process.env.TEST_USER_EMAIL!);
  await page.locator('input[name="password"]').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Accept onboarding redirect — the test account may not be onboarded in the DB
  await page.waitForURL(/\/choristes/, { timeout: 15_000 });
  // Inject onboarding cookies so subsequent tests never hit the onboarding wizard
  const url = new URL(page.url());
  await page.context().addCookies([
    { name: 'mbr_onboarded', value: '1', domain: url.hostname, path: '/' },
  ]);
  // storageState({ path }) triggers a Playwright IPC bug on Node.js v22 — write manually instead
  const cookies = await page.context().cookies();
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies, origins: [] }));
});
