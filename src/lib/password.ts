// Liste de 6 000 mots courants construite depuis Lexique 3 (http://www.lexique.org,
// CC BY-SA 4.0) par scripts/build-wordlist.mjs.
import wordlist from '@/lib/wordlist.json';

export const PASSWORD_WORDS: readonly string[] = wordlist;
export const PASSWORD_WORD_COUNT = 4;

// 4 mots parmi 6 000 → 6000^4 ≈ 1,3 × 10^15 combinaisons (~50,2 bits)

// Plus grand multiple de la taille de la liste tenant sur 32 bits :
// les tirages au-delà sont rejetés pour éviter le biais du modulo.
const MAX_UNBIASED = Math.floor(2 ** 32 / PASSWORD_WORDS.length) * PASSWORD_WORDS.length;

function randomIndex(): number {
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0]!;
    if (value < MAX_UNBIASED) return value % PASSWORD_WORDS.length;
  }
}

// Générateur cryptographique (crypto.getRandomValues), jamais Math.random
export function generatePassword(): string {
  return Array.from({ length: PASSWORD_WORD_COUNT }, () => PASSWORD_WORDS[randomIndex()]).join(
    '-',
  );
}

// Exemple : "falaise-cobalt-tisane-moulin"
