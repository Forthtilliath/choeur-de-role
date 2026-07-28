import { config } from 'dotenv';
import { createHmac } from 'crypto';

config({ path: '.env.local' });
config({ path: '.env.test.local', override: true });

const secret = process.env.TEST_TOTP_SECRET;
if (!secret) {
  console.error('TEST_TOTP_SECRET manquant dans .env.test.local');
  process.exit(1);
}

function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of input.toUpperCase().replace(/=+$/, '')) {
    const val = alphabet.indexOf(char);
    if (val >= 0) bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

const key = base32Decode(secret);
const counter = Math.floor(Date.now() / 1000 / 30);
const buf = Buffer.alloc(8);
buf.writeBigUInt64BE(BigInt(counter));
const hmac = createHmac('sha1', key).update(buf).digest();
const offset = hmac[hmac.length - 1] & 0xf;
const code =
  (((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)) %
  1_000_000;

const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log(`${code.toString().padStart(6, '0')}  (valide encore ~${remaining}s)`);
