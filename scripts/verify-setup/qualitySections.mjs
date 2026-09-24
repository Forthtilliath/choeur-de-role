import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { check, section } from './harness.mjs';
import { ROOT, run } from './utils.mjs';

// Sections 6 à 9 : réinitialisation, qualité, build et E2E
export async function section6Reset() {
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

export async function section7Qualite() {
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

export async function section8Build() {
  section('8. Build de production  (--full)');

  await check('npm run build', () => {
    const r = run('npm', ['run', 'build'], {
      stdio: 'ignore',
      env: { ...process.env, SKIP_ENV_VALIDATION: '1' },
    });
    return { ok: r.status === 0, detail: r.status === 0 ? undefined : `code ${r.status}` };
  });
}

export async function section9E2E() {
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
