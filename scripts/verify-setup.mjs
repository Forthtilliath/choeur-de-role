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
import process from 'node:process';

import { C, results } from './verify-setup/harness.mjs';
import { section1Prerequis, section2Projet, section3Env } from './verify-setup/localSections.mjs';
import {
  section6Reset,
  section7Qualite,
  section8Build,
  section9E2E,
} from './verify-setup/qualitySections.mjs';
import { section4Stack, section5Comptes } from './verify-setup/supabaseSections.mjs';

const args = new Set(process.argv.slice(2));
const RUN_FULL = args.has('--full');
const RUN_E2E = args.has('--e2e');

// ─────────────────────────────────────────────────────────────────────────────
//  Exécution
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`${C.bold}Vérification du setup — Chœur de Rôle${C.reset}`);
  console.log(`${C.gray}Suit les étapes de SETUP.md${C.reset}`);
  if (!RUN_FULL)
    console.log(
      `${C.gray}(ajouter --full pour type-check/lint/tests/build, --e2e pour Playwright)${C.reset}`,
    );

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

  const { pass, warn, fail } = results();
  console.log(
    `\n${C.bold}Résultat :${C.reset} ` +
      `${C.green}${pass} OK${C.reset}, ` +
      `${C.yellow}${warn} avertissement(s)${C.reset}, ` +
      `${C.red}${fail} échec(s)${C.reset}`,
  );

  if (fail > 0) {
    console.log(
      `${C.red}Le projet n'est pas prêt — voir les ✗ ci-dessus (section Dépannage de SETUP.md).${C.reset}`,
    );
    process.exit(1);
  }
  console.log(`${C.green}Environnement prêt : un recruteur peut lancer le projet.${C.reset}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
