// Construit src/lib/wordlist.json à partir de Lexique 3 (http://www.lexique.org, CC BY-SA 4.0).
// Usage : node scripts/build-wordlist.mjs <chemin/Lexique383.tsv> [nombre de mots]
// Retient les formes de base (lemmes) des noms et adjectifs au singulier et des verbes
// à l'infinitif, de 6 à 8 lettres minuscules sans accent, triées par fréquence d'usage.
// Au-delà de ~6 000 mots, Lexique ne fournit plus que des mots rares (taquoir, tellure…).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [input, countArg = '6000'] = process.argv.slice(2);
if (!input) {
  console.error('Usage : node scripts/build-wordlist.mjs <Lexique383.tsv> [nombre de mots]');
  process.exit(1);
}
const COUNT = Number(countArg);
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'wordlist.json');

// Mots écartés : grossiers, injurieux, sexuels, morbides ou gênants dans un email
const BLOCKLIST = new Set(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'wordlist-blocklist.txt'), 'utf8')
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter((w) => w && !w.startsWith('#')),
);

const [header, ...lines] = readFileSync(input, 'utf8').split(/\r?\n/);
const col = Object.fromEntries(header.split('\t').map((name, i) => [name, i]));

const rows = lines.map((line) => line.split('\t')).filter((f) => f[col.ortho]);

// Formes plurielles d'un autre lemme (ex. « animaux » de « animal ») : parfois aussi
// étiquetées comme lemme dans Lexique, on les écarte
const pluralForms = new Set(
  rows.filter((f) => f[col.nombre] === 'p' && f[col.ortho] !== f[col.lemme]).map((f) => f[col.ortho]),
);

const freqByWord = new Map();
for (const f of rows) {
  const ortho = f[col.ortho];
  if (ortho !== f[col.lemme]) continue; // forme de base uniquement
  const cgram = f[col.cgram];
  if (!['NOM', 'ADJ', 'VER'].includes(cgram)) continue;
  if (cgram === 'VER' && !f[col.infover].includes('inf')) continue; // infinitif seulement
  if (f[col.nombre] === 'p' || pluralForms.has(ortho)) continue; // pas de pluriel
  if (!/^[a-z]{6,8}$/.test(ortho)) continue; // sans accent, tiret ni apostrophe
  if (BLOCKLIST.has(ortho)) continue;
  const freq = Number(f[col.freqlemfilms2]) + Number(f[col.freqlemlivres]);
  freqByWord.set(ortho, Math.max(freqByWord.get(ortho) ?? 0, freq)); // dédoublonnage
}

const sorted = [...freqByWord.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
console.log(`Candidats : ${sorted.length}`);
if (sorted.length < COUNT) {
  console.error(`Pas assez de mots (${sorted.length} < ${COUNT})`);
  process.exit(1);
}

const kept = sorted.slice(0, COUNT);
console.log(`Fréquence du dernier mot retenu : ${kept.at(-1)[1].toFixed(2)} / million`);
console.log(`Derniers mots retenus : ${kept.slice(-15).map(([w]) => w).join(' ')}`);

const words = kept.map(([w]) => w).sort();
writeFileSync(OUTPUT, `[\n${words.map((w) => `  "${w}"`).join(',\n')}\n]\n`);
console.log(`${words.length} mots écrits dans ${OUTPUT}`);
