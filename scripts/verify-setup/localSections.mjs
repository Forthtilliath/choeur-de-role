import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { envExample, envLocal } from './env.mjs';
import { check, section } from './harness.mjs';
import { ROOT, run, semverMajor } from './utils.mjs';

// Sections 1 à 3 : prérequis, projet cloné, variables d'environnement
export async function section1Prerequis() {
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

export async function section2Projet() {
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

export async function section3Env() {
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
        ? "valeur d'exemple — OK pour un test local, à régénérer pour un usage réel"
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
