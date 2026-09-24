import { ANON_KEY, envTest, SERVICE_KEY, SUPABASE_URL } from './env.mjs';
import { check, section } from './harness.mjs';
import { fetchWithTimeout, tcpProbe, totp } from './utils.mjs';

// Sections 4 et 5 : stack Supabase locale et comptes de test (dont 2FA admin)
async function restQuery(pathAndQuery, key) {
  const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function section4Stack() {
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

export async function section5Comptes() {
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
    await check("Génération d'un code TOTP (npm run totp)", () => {
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
        return { ok: false, warn: true, detail: "échec de vérification (problème d'horloge ?)" };
      });
    }
  }
}
