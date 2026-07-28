import { wordlist } from "@/lib/wordlist"

export function generatePassphrase(wordCount: number = 4): string {
  const words: string[] = []

  for (let i = 0; i < wordCount; i++) {
    const index = Math.floor(Math.random() * wordlist.length)
    words.push(wordlist[index])
  }

  return words.join("-")
}

// Exemple : "montagne-corbeau-grimoire-patience"