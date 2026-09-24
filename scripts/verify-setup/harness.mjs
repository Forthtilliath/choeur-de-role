// Petit harnais de vérification : sections, lignes ✓ / ! / ✗ et compteurs

export const C = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let pass = 0;
let warn = 0;
let fail = 0;

export function section(title) {
  console.log(`\n${C.bold}${C.cyan}${title}${C.reset}`);
}

/**
 * @param {string} label
 * @param {() => Promise<{ ok: boolean, warn?: boolean, detail?: string } | boolean>} fn
 */
export async function check(label, fn) {
  let result;
  try {
    result = await fn();
  } catch (err) {
    result = { ok: false, detail: err?.message ?? String(err) };
  }
  const norm = typeof result === 'boolean' ? { ok: result } : result;
  const detail = norm.detail ? ` ${C.gray}— ${norm.detail}${C.reset}` : '';

  if (norm.warn) {
    warn++;
    console.log(`  ${C.yellow}!${C.reset} ${label}${detail}`);
  } else if (norm.ok) {
    pass++;
    console.log(`  ${C.green}✓${C.reset} ${label}${detail}`);
  } else {
    fail++;
    console.log(`  ${C.red}✗${C.reset} ${label}${detail}`);
  }
}

export function results() {
  return { pass, warn, fail };
}
