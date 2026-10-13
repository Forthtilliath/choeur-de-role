// Alphanumérique sans caractères ambigus à la lecture (0/O/o, 1/l/I) :
// 56 symboles → 56^8 ≈ 9,7 × 10^13 combinaisons pour 8 caractères (~46,4 bits).
export const PASSWORD_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Plus grand multiple de la taille de l'alphabet tenant sur un octet :
// les octets au-delà sont rejetés pour éviter le biais du modulo.
const MAX_UNBIASED_BYTE = 256 - (256 % PASSWORD_ALPHABET.length);

// Générateur cryptographique (crypto.getRandomValues), jamais Math.random
export function generatePassword(length: number = 8): string {
  if (!Number.isInteger(length) || length < 8) {
    throw new Error('Un mot de passe doit faire au moins 8 caractères');
  }

  let password = '';
  while (password.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte >= MAX_UNBIASED_BYTE) continue;
      password += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];
      if (password.length === length) break;
    }
  }
  return password;
}

// Exemple : "q7RmW3kz"
