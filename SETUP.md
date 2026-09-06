# Installation locale — Chœur de Rôle

Guide pour récupérer le projet et le faire tourner sur sa machine, sans compte
Supabase cloud ni service tiers. Tout le contenu de démonstration (choristes,
concerts, actualités, répertoire...) est inclus dans les migrations SQL et
recréé automatiquement en local.

---

## 1. Prérequis

| Outil | Version | Notes |
| --- | --- | --- |
| **Node.js** | 22 LTS | même version que la CI |
| **npm** | 11+ | `npm install -g npm@11` |
| **Docker Desktop** | récent | requis par la CLI Supabase (Postgres, Auth, Storage locaux) |
| **Git** | — | |

La CLI Supabase est utilisée via `npx` (`npx supabase ...`), rien à installer
globalement.

> **Windows** : lancer les commandes dans PowerShell ou Git Bash, avec Docker
> Desktop démarré.

---

## 2. Récupérer le projet

```bash
git clone https://github.com/forthtilliath/choeur-de-role.git
cd choeur-de-role
npm install
```

---

## 3. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Le fichier d'exemple est préconfiguré pour le **mode local** : les clés Supabase
par défaut y sont déjà renseignées et `SKIP_ENV_VALIDATION=1` neutralise les
services externes (Resend, YouTube, R2, Sentry) qui restent facultatifs.

Seule variable à personnaliser pour un usage réel :

```bash
# génère un secret de session (au choix)
openssl rand -hex 32
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → coller la valeur dans AUTH_SECRET
```

> Les tokens Supabase du fichier d'exemple sont les clés de démonstration
> standard générées par `supabase start` — elles sont identiques sur toutes les
> installations locales et n'ont aucune valeur en dehors de Docker.

---

## 4. Démarrer

### Option A — tout-en-un (recommandé)

```bash
npm run dev:e2e
```

Cette commande :

1. démarre la stack Supabase locale dans Docker (`npx supabase start`) ;
2. applique les migrations `supabase/migrations/` (schéma **+ données de démo**) ;
3. lance le serveur Next.js.

Site accessible sur **http://localhost:3000**.

### Option B — étapes séparées

```bash
npx supabase start      # 1re fois : télécharge les images Docker (~quelques minutes)
npm run dev:local       # serveur Next.js avec Supabase local
```

`dev:local` passe par un proxy same-origin (`/sb-local/**` → `localhost:54321`)
pour contourner CORS/CSP côté navigateur — c'est voulu.

### Services annexes de la stack locale

| Service | URL |
| --- | --- |
| API Supabase | http://127.0.0.1:54321 |
| Base Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Boîte mail de test (Inbucket) | http://127.0.0.1:54324 |

---

## 5. Comptes de connexion (espace choristes / admin)

L'espace membres est protégé par authentification Supabase **avec double facteur
(TOTP)** sur le compte admin. Créer les comptes de test :

```bash
npm run test:e2e:setup
```

Ce script (`create-test-accounts.ts` + `enroll-test-admin-mfa.ts`) crée 3 comptes
et écrit leurs identifiants dans `.env.test.local` :

| Rôle | Email | Accès |
| --- | --- | --- |
| Choriste | `e2e.member@test.cda.invalid` | espace membres |
| Membre du bureau (CA) | `e2e.ca@test.cda.invalid` | + comptes-rendus, tâches |
| Admin | `e2e.admin@test.cda.invalid` | + back-office complet (2FA activé) |

Les mots de passe générés se trouvent dans `.env.test.local` après exécution.

### Se connecter au compte admin (2FA)

Le secret TOTP est stocké dans `.env.test.local` (`TEST_TOTP_SECRET`). Générer un
code à 6 chiffres au moment de la connexion :

```bash
npm run totp
```

> Ces comptes ont `is_test_account = true` : ils sont invisibles partout dans
> l'application (trombinoscope, listes admin, etc.).

---

## 6. Réinitialiser la base

```bash
npm run db:reset
```

Rejoue toutes les migrations (schéma + données de démo) puis recrée les comptes
de test. À utiliser dès que la base locale est dans un état incohérent.

---

## 7. Vérifications qualité

```bash
npm run type-check     # TypeScript
npm run lint           # ESLint
npm test               # tests unitaires (Vitest)
npm run test:e2e       # tests end-to-end (Playwright, nécessite la stack locale)
```

Avant un premier `test:e2e`, installer les navigateurs Playwright :

```bash
npx playwright install
```

---

## 8. Build de production en local

```bash
npm run build
npm run start
```

Le build a besoin de toutes les variables **sans** `SKIP_ENV_VALIDATION`
(ou du flag `SKIP_ENV_VALIDATION=1` pour un build de test sans services tiers).

---

## 9. Vérifier l'installation en une commande

Une fois la stack démarrée (étape 4) et les comptes créés (étape 5) :

```bash
npm run verify:setup
```

Le script (`scripts/verify-setup.mjs`) rejoue les étapes de ce guide sous forme
de checklist :

| Section | Contrôles |
| --- | --- |
| 1. Prérequis | Node ≥ 22, npm ≥ 11, Git, Docker CLI + démon démarré |
| 2. Projet | `node_modules/` et modules clés résolus |
| 3. Env | `.env.local` présent, variables requises, mode local |
| 4. Stack | API Supabase, Postgres, Inbucket joignables ; migrations + données de démo |
| 5. Comptes | `.env.test.local`, connexion des 3 comptes, `is_test_account`, cycle 2FA admin complet |
| 6. Reset | scripts et migrations présents |

Options :

```bash
npm run verify:setup -- --full      # + type-check, lint, tests unitaires, build
npm run verify:setup -- --e2e       # + smoke Playwright (chaque page se charge, 3 rôles)
npm run verify:setup:full           # raccourci : --full --e2e
```

> `--e2e` ne lance que `smoke.spec.ts` (vérification « toutes les pages se
> chargent »). La suite complète `npm run test:e2e` contient des specs CRUD
> sensibles au timing du serveur dev et peut être ponctuellement instable.

Sortie `0` si tout passe (les avertissements ne bloquent pas), `1` si un contrôle échoue.

---

## Dépannage

| Symptôme | Piste |
| --- | --- |
| `supabase start` échoue | Docker Desktop non démarré, ou ports 54321-54324 déjà pris |
| Page blanche / erreurs Supabase dans la console | stack locale arrêtée → `npx supabase start` |
| `Invalid environment variables` au build | variable manquante ou `SKIP_ENV_VALIDATION` non défini |
| Connexion admin refusée | code TOTP expiré → régénérer avec `npm run totp` |
| Images/fichiers du répertoire cassés | normal sans R2 configuré en mode local |
| Réinitialiser complètement | `npx supabase stop --no-backup` puis `npm run dev:e2e` |

---

## Déploiement en ligne

Voir [DEPLOY.md](DEPLOY.md).
