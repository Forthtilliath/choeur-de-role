import { wordlist } from '@/lib/wordlist';

export function generatePassphrase(wordCount: number = 4): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const word = wordlist[Math.floor(Math.random() * wordlist.length)];
    if (word === undefined) throw new Error('La liste de mots est vide');
    words.push(word);
  }

  return words.join('-');
}

// Exemple : "montagne-corbeau-grimoire-patience"
