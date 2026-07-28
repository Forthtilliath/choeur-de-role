import { test as setup } from '@playwright/test';
import { createHmac } from 'crypto';
import fs from 'fs';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '.auth/admin.json');

function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of input.toUpperCase().replace(/=+$/, '')) {
    const val = alphabet.indexOf(char);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTOTP(secret: string): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1_000_000;
  return code.toString().padStart(6, '0');
}

setup('connexion admin', async ({ page }) => {
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
  await page.locator('input[name="email"]').fill(process.env.TEST_ADMIN_EMAIL!);
  await page.locator('input[name="password"]').fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // Wait for MFA step (admin accounts require TOTP)
  await page.waitForSelector('input[autocomplete="one-time-code"]', { timeout: 10_000 });
  const code = generateTOTP(process.env.TEST_TOTP_SECRET!);
  await page.locator('input[autocomplete="one-time-code"]').fill(code);
  await page.getByRole('button', { name: 'Vérifier' }).click();

  // Accept onboarding redirect — the test account may not be onboarded in the DB
  await page.waitForURL(/\/choristes/, { timeout: 15_000 });

  // Inject onboarding cookies so subsequent tests never hit the onboarding wizard
  const url = new URL(page.url());
  await page.context().addCookies([
    { name: 'mbr_onboarded', value: '1', domain: url.hostname, path: '/' },
    { name: 'admin_onboarded', value: '1', domain: url.hostname, path: '/' },
  ]);
  // storageState({ path }) triggers a Playwright IPC bug on Node.js v22 — write manually instead
  const cookies = await page.context().cookies();
  fs.mkdirSync(path.dirname(ADMIN_AUTH_FILE), { recursive: true });
  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify({ cookies, origins: [] }));
});
