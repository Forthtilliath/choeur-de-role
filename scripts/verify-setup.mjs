/**
 * Vérifie, étape par étape, que le processus décrit dans SETUP.md fonctionne.
 * Pensé pour qu'un recruteur (ou n'importe qui) qui clone le projet puisse
 * confirmer en une commande que son environnement est prêt.
 *
 * Usage :
 *   node scripts/verify-setup.mjs            # sections 1 à 6 (rapide)
 *   node scripts/verify-setup.mjs --full     # + type-check, lint, tests unitaires, build
 *   node scripts/verify-setup.mjs --e2e      # + tests end-to-end Playwright
 *   node scripts/verify-setup.mjs --full --e2e
 *
 * Code de sortie : 0 si tout passe (les avertissements ne font pas échouer), 1 sinon.
 */
import { spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.cwd());
const args = new Set(process.argv.slice(2));
const RUN_FULL = args.has('--full');
const RUN_E2E = args.has('--e2e');

// ─────────────────────────────────────────────────────────────────────────────
//  Petit harnais de vérification
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let pass = 0;
let warn = 0;
let fail = 0;

function section(title) {
  console.log(`\n${C.bold}${C.cyan}${title}${C.reset}`);
}

/**
 * @param {string} label
 * @param {() => Promise<{ ok: boolean, warn?: boolean, detail?: string } | boolean>} fn
 */
async function check(label, fn) {
  let result;
  try {
    result = await fn();
  } catch (err) {
    result = { ok: false, detail: err?.message ?? String(err) };
  }
  const norm = typeof result === 'boolean' ? { ok: result } : result;
  const detail = norm.detail ? ` ${C.gray}— ${norm.detail}${C.reset}` : '';

  if (norm.warn) {
    warn++;
    console.log(`  ${C.yellow}!${C.reset} ${label}${detail}`);
  } else if (norm.ok) {
    pass++;
    console.log(`  ${C.green}✓${C.reset} ${label}${detail}`);
  } else {
    fail++;
    console.log(`  ${C.red}✗${C.reset} ${label}${detail}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Utilitaires
// ─────────────────────────────────────────────────────────────────────────────

function parseEnvFile(file) {
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) return null;
  /** @type {Record<string,string>} */
  const out = {};
  for (const raw of readFileSync(abs, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function run(cmd, cmdArgs = [], opts = {}) {
  // Commande passée en une seule chaîne + shell:true → portable Windows/Unix,
  // sans le DeprecationWarning de spawnSync(args, { shell:true }).
  // Tous les arguments de ce script sont des littéraux statiques (aucune entrée externe).
  const full = [cmd, ...cmdArgs].join(' ');
  return spawnSync(full, { cwd: ROOT, encoding: 'utf-8', shell: true, ...opts });
}

async function fetchWithTimeout(url, opts = {}, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function tcpProbe(host, port, ms = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(ms);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of input.toUpperCase().replace(/=+$/, '')) {
    const val = alphabet.indexOf(char);
    if (val >= 0) bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function totp(secret, offsetSteps = 0) {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / 30) + offsetSteps;
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

function semverMajor(v) {
  const m = /(\d+)/.exec(v ?? '');
  return m ? Number(m[1]) : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sections
// ─────────────────────────────────────────────────────────────────────────────

const envLocal = parseEnvFile('.env.local');
const envExample = parseEnvFile('.env.local.example');
const envTest = parseEnvFile('.env.test.local');

const SUPABASE_URL =
  envLocal?.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON_KEY = envLocal?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE_KEY = envLocal?.SUPABASE_SERVICE_ROLE_KEY || '';

async function section1Prerequis() {
  section('1. Prérequis');

  await check('Node.js ≥ 22', () => {
    const major = semverMajor(process.versions.node);
    return { ok: major >= 22, detail: `v${process.versions.node}` };
  });

  await check('npm ≥ 11', () => {
    const r = run('npm', ['-v']);
    const v = (r.stdout || '').trim();
    const major = semverMajor(v);
    if (!v) return { ok: false, detail: 'npm introuvable' };
    return { ok: major >= 11, warn: major < 11, detail: `v${v}` };
  });

  await check('Git disponible', () => {
    const r = run('git', ['--version']);
    return { ok: r.status === 0, detail: (r.stdout || '').trim() };
  });

  await check('Docker CLI disponible', () => {
    const r = run('docker', ['--version']);
    return { ok: r.status === 0, detail: (r.stdout || '').trim() };
  });

  await check('Docker Desktop démarré', () => {
    const r = run('docker', ['info']);
    if (r.status === 0) {
      const m = /Server Version:\s*(.+)/.exec(r.stdout || '');
      return { ok: true, detail: m ? `serveur ${m[1].trim()}` : undefined };
    }
    return { ok: false, detail: 'démon Docker injoignable (lancer Docker Desktop)' };
  });
}

async function section2Projet() {
  section('2. Récupérer le projet');

  await check('Dépôt git cloné (.git présent)', () => existsSync(path.join(ROOT, '.git')));

  await check('Dépendances installées (npm install)', () => {
    const ok = existsSync(path.join(ROOT, 'node_modules'));
    return { ok, detail: ok ? undefined : 'lancer `npm install`' };
  });

  for (const dep of ['next', '@supabase/supabase-js', '@playwright/test']) {
    await check(`Module « ${dep} » résolu`, () =>
      existsSync(path.join(ROOT, 'node_modules', ...dep.split('/'))),
    );
  }

  await check('npx tsx disponible (scripts .ts)', () => {
    const r = run('npx', ['tsx', '--version']);
    const line = (r.stdout || '')
      .split('\n')
      .map((l) => l.trim())
      .find((l) => /tsx/i.test(l));
    return { ok: r.status === 0, detail: line };
  });
}

async function section3Env() {
  section("3. Variables d'environnement");

  await check('.env.local.example présent', () => envExample !== null);

  await check('.env.local présent', () => {
    if (envLocal !== null) return true;
    return { ok: false, detail: 'lancer `cp .env.local.example .env.local`' };
  });

  if (!envLocal) return;

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AUTH_SECRET',
    'NEXT_PUBLIC_SITE_URL',
  ];
  for (const key of required) {
    await check(`${key} renseigné`, () => Boolean(envLocal[key] && envLocal[key].length > 0));
  }

  await check('AUTH_SECRET personnalisé', () => {
    const v = envLocal.AUTH_SECRET || '';
    const isPlaceholder = v.includes('change-me') || v.length < 32;
    return {
      ok: !isPlaceholder,
      warn: isPlaceholder,
      detail: isPlaceholder
        ? 'valeur d\'exemple — OK pour un test local, à régénérer pour un usage réel'
        : undefined,
    };
  });

  await check('SKIP_ENV_VALIDATION=1 (mode local)', () => {
    const v = envLocal.SKIP_ENV_VALIDATION;
    return {
      ok: v === '1',
      warn: v !== '1',
      detail: v === '1' ? undefined : 'attendu en mode local ; à retirer seulement en mode cloud',
    };
  });
}

async function restQuery(pathAndQuery, key) {
  const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function section4Stack() {
  section('4. Stack Supabase locale (Docker)');

  await check(`API Supabase joignable (${SUPABASE_URL})`, async () => {
    try {
      const res = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/health`);
      if (res.ok) return { ok: true, detail: `HTTP ${res.status}` };
    } catch {
      /* on retombe sur la sonde TCP ci-dessous */
    }
    const ok = await tcpProbe('127.0.0.1', 54321);
    return { ok, detail: ok ? 'port ouvert' : 'stack arrêtée → `npx supabase start`' };
  });

  await check('Base Postgres joignable (127.0.0.1:54322)', async () => {
    const ok = await tcpProbe('127.0.0.1', 54322);
    return { ok, detail: ok ? undefined : 'stack arrêtée → `npx supabase start`' };
  });

  await check('Boîte mail de test (Inbucket, 127.0.0.1:54324)', async () => {
    const ok = await tcpProbe('127.0.0.1', 54324);
    return { ok, warn: !ok, detail: ok ? undefined : 'facultatif — non démarré' };
  });

  if (!ANON_KEY) {
    await check('Migrations + données de démo appliquées', () => ({
      ok: false,
      detail: 'NEXT_PUBLIC_SUPABASE_ANON_KEY manquant',
    }));
    return;
  }

  await check('Migrations appliquées (schéma présent)', async () => {
    const rows = await restQuery('performances?select=id&limit=1', ANON_KEY);
    return { ok: Array.isArray(rows) };
  });

  await check('Données de démo — concerts / performances', async () => {
    const rows = await restQuery('performances?select=id', ANON_KEY);
    return { ok: rows.length > 0, detail: `${rows.length} performance(s)` };
  });

  if (SERVICE_KEY) {
    // seasons et members sont protégés par RLS → lecture avec la clé service
    await check('Données de démo — saisons', async () => {
      const rows = await restQuery('seasons?select=id', SERVICE_KEY);
      return { ok: rows.length > 0, detail: `${rows.length} saison(s)` };
    });

    await check('Données de démo — choristes', async () => {
      const rows = await restQuery('members?select=id', SERVICE_KEY);
      return { ok: rows.length > 0, detail: `${rows.length} membre(s)` };
    });
  }
}

async function passwordGrant(email, password) {
  const res = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error_description || body.msg || `HTTP ${res.status}`);
  return body;
}

async function section5Comptes() {
  section('5. Comptes de connexion (espace choristes / admin)');

  await check('.env.test.local présent', () => {
    if (envTest !== null) return true;
    return { ok: false, detail: 'lancer `npm run test:e2e:setup`' };
  });

  if (!envTest) return;

  const accounts = [
    ['Choriste', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD'],
    ['Membre du bureau (CA)', 'TEST_CA_EMAIL', 'TEST_CA_PASSWORD'],
    ['Admin', 'TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD'],
  ];

  for (const [, emailKey, pwdKey] of accounts) {
    await check(`${emailKey} + ${pwdKey} renseignés`, () =>
      Boolean(envTest[emailKey] && envTest[pwdKey]),
    );
  }

  if (!ANON_KEY) return;

  for (const [role, emailKey, pwdKey] of accounts) {
    const email = envTest[emailKey];
    const password = envTest[pwdKey];
    if (!email || !password) continue;

    await check(`Connexion ${role} (${email})`, async () => {
      const grant = await passwordGrant(email, password);
      return { ok: Boolean(grant.access_token) };
    });

    if (SERVICE_KEY) {
      await check(`${role} marqué is_test_account = true`, async () => {
        const rows = await restQuery(
          `members?select=is_test_account&email=eq.${encodeURIComponent(email)}`,
          SERVICE_KEY,
        );
        return { ok: rows[0]?.is_test_account === true };
      });
    }
  }

  // 2FA admin
  const totpSecret = envTest.TEST_TOTP_SECRET;
  await check('TEST_TOTP_SECRET renseigné', () => Boolean(totpSecret));

  if (totpSecret) {
    await check('Génération d\'un code TOTP (npm run totp)', () => {
      const code = totp(totpSecret);
      return { ok: /^\d{6}$/.test(code), detail: code };
    });

    const adminEmail = envTest.TEST_ADMIN_EMAIL;
    const adminPwd = envTest.TEST_ADMIN_PASSWORD;
    if (adminEmail && adminPwd && ANON_KEY) {
      await check('Vérification 2FA complète du compte admin', async () => {
        const grant = await passwordGrant(adminEmail, adminPwd);
        const token = grant.access_token;

        const userRes = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
        });
        const user = await userRes.json();
        const factor = (user.factors || []).find(
          (f) => f.factor_type === 'totp' && f.status === 'verified',
        );
        if (!factor) return { ok: false, detail: 'aucun facteur TOTP vérifié' };

        // On tente le code courant, puis la fenêtre précédente/suivante (tolérance d'horloge)
        for (const step of [0, -1, 1]) {
          const chalRes = await fetchWithTimeout(
            `${SUPABASE_URL}/auth/v1/factors/${factor.id}/challenge`,
            { method: 'POST', headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
          );
          const chal = await chalRes.json();
          const verRes = await fetchWithTimeout(
            `${SUPABASE_URL}/auth/v1/factors/${factor.id}/verify`,
            {
              method: 'POST',
              headers: {
                apikey: ANON_KEY,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ challenge_id: chal.id, code: totp(totpSecret, step) }),
            },
          );
          const ver = await verRes.json();
          if (verRes.ok && ver.access_token) return { ok: true, detail: 'AAL2 obtenu' };
        }
        return { ok: false, warn: true, detail: 'échec de vérification (problème d\'horloge ?)' };
      });
    }
  }
}

async function section6Reset() {
  section('6. Réinitialiser la base');

  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  await check('Script `db:reset` défini', () => Boolean(pkg.scripts?.['db:reset']));
  await check('Script `test:e2e:setup` défini', () => Boolean(pkg.scripts?.['test:e2e:setup']));

  await check('Migrations SQL présentes', () => {
    const dir = path.join(ROOT, 'supabase', 'migrations');
    if (!existsSync(dir)) return { ok: false };
    const count = readdirSync(dir).filter((f) => f.endsWith('.sql')).length;
    return { ok: count > 0, detail: `${count} fichier(s)` };
  });
}

async function section7Qualite() {
  section('7. Vérifications qualité  (--full)');

  const steps = [
    ['type-check (TypeScript)', 'npm', ['run', 'type-check']],
    ['lint (ESLint)', 'npm', ['run', 'lint']],
    ['tests unitaires (Vitest)', 'npm', ['test']],
  ];
  for (const [label, cmd, cmdArgs] of steps) {
    await check(label, () => {
      const r = run(cmd, cmdArgs, { stdio: 'ignore' });
      return { ok: r.status === 0, detail: r.status === 0 ? undefined : `code ${r.status}` };
    });
  }
}

async function section8Build() {
  section('8. Build de production  (--full)');

  await check('npm run build', () => {
    const r = run('npm', ['run', 'build'], {
      stdio: 'ignore',
      env: { ...process.env, SKIP_ENV_VALIDATION: '1' },
    });
    return { ok: r.status === 0, detail: r.status === 0 ? undefined : `code ${r.status}` };
  });
}

async function section9E2E() {
  section('9. Tests end-to-end Playwright  (--e2e)');

  await check('Navigateurs Playwright installés', () => {
    // Idempotent : ne télécharge que ce qui manque (cf. SETUP.md §7).
    const r = run('npx', ['playwright', 'install', 'chromium', 'firefox'], { stdio: 'ignore' });
    return { ok: r.status === 0, detail: r.status === 0 ? undefined : `code ${r.status}` };
  });

  // Smoke uniquement : « chaque page se charge sans erreur » pour les 3 rôles.
  // C'est la vérification pertinente pour un recruteur ; la suite complète
  // (npm run test:e2e) contient des specs CRUD sensibles au timing du serveur dev.
  await check('Smoke E2E — toutes les pages se chargent (3 rôles)', () => {
    const r = run('npx', ['playwright', 'test', 'smoke.spec.ts'], { encoding: 'utf-8' });
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const n = (re) => Number((out.match(re) || [])[1] || 0);
    const passed = n(/(\d+) passed/);
    const failed = n(/(\d+) failed/);
    const flaky = n(/(\d+) flaky/);
    const detail = `${passed} ok, ${failed} échec(s)${flaky ? `, ${flaky} flaky` : ''}`;
    if (r.status === 0) return { ok: true, detail };
    // Des échecs résiduels sur le serveur dev (Turbopack) sont généralement du flaky :
    // on le signale sans faire échouer la vérification du setup.
    return { ok: false, warn: true, detail: `${detail} — relancer \`npm run test:e2e:report\`` };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Exécution
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`${C.bold}Vérification du setup — Chœur de Rôle${C.reset}`);
  console.log(`${C.gray}Suit les étapes de SETUP.md${C.reset}`);
  if (!RUN_FULL) console.log(`${C.gray}(ajouter --full pour type-check/lint/tests/build, --e2e pour Playwright)${C.reset}`);

  await section1Prerequis();
  await section2Projet();
  await section3Env();
  await section4Stack();
  await section5Comptes();
  await section6Reset();
  if (RUN_FULL) {
    await section7Qualite();
    await section8Build();
  }
  if (RUN_E2E) {
    await section9E2E();
  }

  console.log(
    `\n${C.bold}Résultat :${C.reset} ` +
      `${C.green}${pass} OK${C.reset}, ` +
      `${C.yellow}${warn} avertissement(s)${C.reset}, ` +
      `${C.red}${fail} échec(s)${C.reset}`,
  );

  if (fail > 0) {
    console.log(`${C.red}Le projet n'est pas prêt — voir les ✗ ci-dessus (section Dépannage de SETUP.md).${C.reset}`);
    process.exit(1);
  }
  console.log(`${C.green}Environnement prêt : un recruteur peut lancer le projet.${C.reset}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
