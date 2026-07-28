// Starts the Next.js dev server with local Docker Supabase env vars.
// The browser can't reach localhost:54321 directly (CORS + CSP), so we:
//   1. Override NEXT_PUBLIC_SUPABASE_URL to http://localhost:3000/sb-local
//   2. Enable a Next.js rewrite: /sb-local/** → http://localhost:54321/**
// This makes all Supabase calls same-origin from the browser's perspective.
import { config } from 'dotenv';
import { spawn } from 'child_process';

config({ path: '.env.local' });
config({ path: '.env.test.local', override: true });

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:3000/sb-local';
process.env.NEXT_PUBLIC_SUPABASE_PROXY_MODE = '1';

const child = spawn('npx', ['next', 'dev'], {
  env: process.env,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
