# Déploiement en ligne — Chœur de Rôle

Cible : **Vercel** (hébergement de l'app Next.js) + **Supabase Cloud** (base,
auth, storage) + **Cloudflare R2** (fichiers). Tous ces services ont une offre
gratuite suffisante pour une démo de portfolio.

---

## Vue d'ensemble

```
GitHub (push main)  ──►  Vercel (build + hébergement Next.js)
                              │
                              ├──►  Supabase Cloud   (Postgres + Auth + Storage)
                              ├──►  Cloudflare R2     (répertoire, images)
                              └──►  Resend            (email de contact)
```

---

## 1. Supabase Cloud

1. Créer un projet sur [supabase.com](https://supabase.com) (région Europe).
2. Lier le projet local et pousser le schéma :

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-du-projet>
   npx supabase db push        # applique supabase/migrations/ (schéma + données de démo)
   ```

3. **Auth → URL Configuration** :
   - *Site URL* : `https://<domaine-vercel>`
   - *Redirect URLs* : `https://<domaine-vercel>/**`
4. **Project Settings → API** : relever `URL`, `anon key`, `service_role key`.
5. Créer un compte de démonstration (voir §5).

> **Plan gratuit** : le projet est mis en pause après 7 jours sans activité.
> Prévoir un ping hebdomadaire (GitHub Action / cron Supabase) si la démo doit
> rester disponible en continu.

---

## 2. Cloudflare R2

1. Cloudflare dashboard → **R2** → créer deux buckets : `cdr-repertoire` et
   `cdr-images`.
2. Sur `cdr-images` : **Settings → Public access** → activer le domaine `r2.dev`.
3. **Manage R2 API Tokens** → créer un token *Object Read & Write*.
4. Relever : endpoint S3, Access Key ID, Secret Access Key, URL publique.

> Sans R2, l'app peut fonctionner sur le fallback Supabase Storage — mais prévoir
> alors les buckets correspondants côté Supabase.

---

## 3. Resend (email de contact)

1. Créer un compte [resend.com](https://resend.com), vérifier un domaine (ou
   utiliser le domaine de test).
2. Générer une API key → `RESEND_API_KEY`.

---

## 4. Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importer le dépôt
   GitHub `choeur-de-role`.
2. Framework : **Next.js** (détecté). Build command et output par défaut.
3. Renseigner les variables d'environnement (onglet *Settings → Environment
   Variables*), pour *Production* **et** *Preview* :

   | Variable | Source |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | URL Vercel (`https://choeur-de-role.vercel.app`) |
   | `AUTH_SECRET` | `openssl rand -hex 32` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (secret) |
   | `RESEND_API_KEY` | Resend |
   | `NEXT_MAIL_CONTACT` | adresse destinataire du formulaire |
   | `YOUTUBE_API_KEY` | Google Cloud Console (API YouTube Data v3) |
   | `CLOUDFLARE_R2_ENDPOINT` | Cloudflare R2 |
   | `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 (secret) |
   | `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 (secret) |
   | `CLOUDFLARE_R2_BUCKET_NAME` | `cdr-repertoire` |
   | `CLOUDFLARE_R2_IMAGES_BUCKET_NAME` | `cdr-images` |
   | `CLOUDFLARE_R2_PUBLIC_URL` | URL publique `r2.dev` |

   Optionnel : `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`,
   `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

   > Ne **pas** définir `SKIP_ENV_VALIDATION` en production : la validation Zod
   > (`src/env.ts`) doit s'appliquer.

4. **Deploy**. À chaque `push` sur `main`, redéploiement automatique ; chaque PR
   obtient une URL de preview.
5. Une fois l'URL connue, revenir mettre à jour :
   - `NEXT_PUBLIC_SITE_URL` sur Vercel,
   - *Site URL* / *Redirect URLs* sur Supabase.

---

## 5. Compte de démonstration

Pour qu'un visiteur puisse explorer l'espace membres et le back-office :

- Créer un compte dédié dans Supabase (**Auth → Users → Add user**, email
  confirmé), puis insérer la ligne `members` correspondante avec le rôle
  souhaité (`member`, `ca` ou `admin`).
- Le compte `admin` exige un second facteur (TOTP) : l'enrôler à la première
  connexion, ou adapter un compte `ca` (large accès, sans 2FA imposé) pour la
  démo publique.
- Publier les identifiants sur la page de connexion ou dans le README.

**Protection des données de démo** : n'importe quel visiteur avec un accès admin
peut modifier le contenu. Options :

- job planifié (GitHub Action) qui rejoue `npx supabase db reset --linked`
  périodiquement pour remettre la démo à zéro ;
- ou compte de démo en lecture seule via des politiques RLS restrictives.

---

## 6. Checklist de mise en ligne

- [ ] Projet Supabase créé, `db push` effectué
- [ ] Buckets R2 créés + accès public sur les images
- [ ] Domaine vérifié sur Resend
- [ ] Variables d'environnement renseignées sur Vercel (Production + Preview)
- [ ] Premier déploiement Vercel réussi
- [ ] `NEXT_PUBLIC_SITE_URL` + Redirect URLs Supabase alignés sur l'URL finale
- [ ] Compte de démonstration créé et testé (connexion + 2FA)
- [ ] Formulaire de contact testé (email reçu)
- [ ] Galerie vidéos alimentée (quota YouTube OK)
- [ ] Lighthouse / `npm run build` sans erreur
- [ ] Lien « Démo en ligne » ajouté au README

---

## Diaporama de présentation

Le dossier [`presentation/`](presentation/) contient une présentation reveal.js
autonome.

```bash
npm run slides            # sert la présentation sur http://localhost:5500
npm run slides:deploy     # déploie presentation/ sur Vercel (projet séparé)
```
