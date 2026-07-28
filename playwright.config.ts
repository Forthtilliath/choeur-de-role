import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test.local'), override: true });

// Lire .env.test.local directement pour les vars webServer (contourne toute pollution de process.env)
const testEnv = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.test.local'), 'utf-8'));

export default defineConfig({
  testDir: './e2e',
  tsconfig: './tsconfig.playwright.json',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // Authentification — sauvegarde les cookies de session
    {
      name: 'setup:user',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup:admin',
      testMatch: /admin\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests sans session (login, redirections)
    {
      name: 'no-auth',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests pages publiques (sans authentification)
    {
      name: 'public',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests création de compte (setup/teardown via Admin API Supabase)
    {
      name: 'inscription',
      testMatch: /inscription\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests pages choristes (session membre + visibilité admin)
    {
      name: 'choriste',
      testMatch: /choristes\/.+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup:user', 'setup:admin'],
    },
    // Tests en tant que choriste (session membre)
    {
      name: 'user',
      testMatch: /repertoire\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup:user'],
    },
    // Tests en tant qu'admin (session admin)
    {
      name: 'admin',
      testMatch: /admin\/.+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup:admin'],
    },
    // Smoke tests — toutes les pages se chargent sans erreur
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup:user', 'setup:admin'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: testEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: testEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
});
