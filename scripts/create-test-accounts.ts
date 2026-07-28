/**
 * Creates (or recreates) the 3 dedicated E2E test accounts in local Supabase.
 * These accounts have is_test_account=true so they are invisible everywhere in the app.
 *
 * Idempotent: reuses passwords already in .env.test.local so running this script
 * multiple times never invalidates the existing test configuration.
 *
 * Usage: npx tsx scripts/create-test-accounts.ts
 *
 * After running:
 *   Run: npx tsx scripts/enroll-test-admin-mfa.ts   (to enroll 2FA on the admin account)
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });
config({ path: '.env.test.local', override: true });

const ENV_FILE = path.resolve('.env.test.local');

function generatePassword(): string {
  return `E2E-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}!`;
}

function getOrGenerate(key: string): string {
  const existing = process.env[key];
  if (existing) {
    console.log(`  ↺ ${key} : mot de passe existant réutilisé`);
    return existing;
  }
  console.log(`  ✦ ${key} : nouveau mot de passe généré`);
  return generatePassword();
}

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

type AccountConfig = {
  envPrefix: string;
  role: 'member' | 'ca' | 'admin';
  firstName: string;
  lastName: string;
};

const ACCOUNTS: AccountConfig[] = [
  { envPrefix: 'TEST_USER', role: 'member', firstName: 'E2E', lastName: 'Choriste' },
  { envPrefix: 'TEST_CA', role: 'ca', firstName: 'E2E', lastName: 'CA' },
  { envPrefix: 'TEST_ADMIN', role: 'admin', firstName: 'E2E', lastName: 'Admin' },
];

type SeasonAndVoicePart = {
  activeSeasonId: string | null;
  defaultVoicePartId: string | null;
};

async function fetchSeasonAndVoicePart(): Promise<SeasonAndVoicePart> {
  const [{ data: season }, { data: voicePart }] = await Promise.all([
    supabase.from('seasons').select('id').eq('active', true).limit(1).maybeSingle(),
    supabase
      .from('voice_parts')
      .select('id')
      .eq('is_voice_part', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!season) console.warn('  ⚠ Aucune saison active trouvée — inscription ignorée');
  if (!voicePart) console.warn('  ⚠ Aucun pupitre trouvé — voice_part_id ignoré');

  return { activeSeasonId: season?.id ?? null, defaultVoicePartId: voicePart?.id ?? null };
}

async function createAccount(
  cfg: AccountConfig,
  { activeSeasonId, defaultVoicePartId }: SeasonAndVoicePart,
): Promise<{ email: string; password: string }> {
  const email = `e2e.${cfg.role}@test.cda.invalid`;
  const passwordKey = `${cfg.envPrefix}_PASSWORD`;

  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email === email);

  let userId: string;
  let password: string;

  if (found) {
    password = process.env[passwordKey]!;
    userId = found.id;
    console.log(`  ↺ ${cfg.role} déjà existant (${found.id})`);
  } else {
    password = getOrGenerate(passwordKey);
    console.log(`  ✦ Création du compte ${cfg.role}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: cfg.firstName, last_name: cfg.lastName },
    });
    if (error || !data.user) throw new Error(`createUser(${cfg.role}) failed: ${error?.message}`);
    userId = data.user.id;
  }

  // Remove any stale members row with same email but a different id (orphan from a previous delete+recreate)
  await supabase.from('members').delete().eq('email', email).neq('id', userId);

  // Always upsert members row — the DB trigger may not exist in local Docker
  const { error: upsertError } = await supabase
    .from('members')
    .upsert({
      id: userId,
      first_name: cfg.firstName,
      last_name: cfg.lastName,
      email,
      role: cfg.role,
      onboarded_at: new Date().toISOString(),
      is_test_account: true,
      ...(defaultVoicePartId ? { voice_part_id: defaultVoicePartId } : {}),
    });
  if (upsertError) throw new Error(`members.upsert(${cfg.role}) failed: ${upsertError.message}`);

  if (defaultVoicePartId) console.log(`  ✓ Pupitre assigné`);

  // Enroll in active season if not already enrolled
  if (activeSeasonId) {
    const { data: existingEnrollment } = await supabase
      .from('member_season')
      .select('id')
      .eq('member_id', userId)
      .eq('season_id', activeSeasonId)
      .maybeSingle();

    if (!existingEnrollment) {
      const { error: enrollError } = await supabase
        .from('member_season')
        .insert({ member_id: userId, season_id: activeSeasonId });
      if (enrollError) throw new Error(`member_season.insert(${cfg.role}) failed: ${enrollError.message}`);
      console.log(`  ✓ Inscrit à la saison active`);
    } else {
      console.log(`  ↺ Déjà inscrit à la saison active`);
    }
  }

  console.log(`  ✓ ${cfg.role} → ${email}`);
  return { email, password };
}

async function main() {
  console.log(`Cible Supabase : ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log('Création des comptes E2E...\n');

  const seasonAndVoicePart = await fetchSeasonAndVoicePart();

  for (const cfg of ACCOUNTS) {
    const { email, password } = await createAccount(cfg, seasonAndVoicePart);
    updateEnvFile({ [`${cfg.envPrefix}_EMAIL`]: email });
    updateEnvFile({ [`${cfg.envPrefix}_PASSWORD`]: password });
    console.log(`${cfg.envPrefix}_EMAIL=` + email);
    console.log(`${cfg.envPrefix}_PASSWORD=` + password);
  }

  console.log('\nÉtape suivante :');
  console.log('  npx tsx scripts/enroll-test-admin-mfa.ts');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
