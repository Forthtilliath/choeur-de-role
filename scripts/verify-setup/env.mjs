import { parseEnvFile } from './utils.mjs';

export const envLocal = parseEnvFile('.env.local');
export const envExample = parseEnvFile('.env.local.example');
export const envTest = parseEnvFile('.env.test.local');

export const SUPABASE_URL = envLocal?.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
export const ANON_KEY = envLocal?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SERVICE_KEY = envLocal?.SUPABASE_SERVICE_ROLE_KEY || '';
