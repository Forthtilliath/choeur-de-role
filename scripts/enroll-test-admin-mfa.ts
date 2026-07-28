/**
 * Enrolls TEST_ADMIN_EMAIL with a TOTP factor in local Supabase and writes
 * TEST_TOTP_SECRET directly into .env.test.local (no manual copy-paste needed).
 *
 * Usage: npx tsx scripts/enroll-test-admin-mfa.ts
 *
 * Prerequisites: TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD must be set in .env.test.local
 * and NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
config({ path: '.env.local' });
config({ path: '.env.test.local', override: true });
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const ENV_FILE = path.resolve('.env.test.local');

function updateEnvFile(updates: Record<string, string>): void {
  const raw = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf-8') : '';
  let content = raw.replace(/\r\n/g, '\n');
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content = content.trimEnd() + `\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set in .env.test.local');
    process.exit(1);
  }

  console.log(`Signing in as ${email}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !signInData.user) {
    console.error('Sign-in failed:', signInError?.message);
    process.exit(1);
  }

  // Use admin API to delete ALL factors (including pending ones not visible via user API)
  const userId = signInData.user.id;
  const { data: adminFactors } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId });
  for (const factor of adminFactors?.factors ?? []) {
    console.log(`Deleting factor ${factor.id} (${factor.status}, "${factor.friendly_name}")...`);
    await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId, id: factor.id });
  }

  // Enroll a new TOTP factor
  console.log('Enrolling new TOTP factor...');
  const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'E2E Test',
  });
  if (enrollError || !enrollData) {
    console.error('Enroll failed:', enrollError?.message);
    process.exit(1);
  }

  const secret = enrollData.totp.secret;
  const factorId = enrollData.id;

  // Generate a TOTP code with built-in crypto and verify the enrollment
  const code = generateTOTP(secret);
  console.log(`Generated TOTP code: ${code}`);

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError || !challenge) {
    console.error('Challenge failed:', challengeError?.message);
    process.exit(1);
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (verifyError) {
    console.error('Verify failed (wrong code or timing issue — try again):', verifyError.message);
    process.exit(1);
  }

  updateEnvFile({ TEST_TOTP_SECRET: secret });

  console.log('\n✅ TOTP factor enrolled and verified.');
  console.log('TEST_TOTP_SECRET écrit dans .env.test.local');
  console.log('\nPour GitHub CI, ajoute manuellement :');
  console.log('  TEST_TOTP_SECRET=' + secret);
}

main();
