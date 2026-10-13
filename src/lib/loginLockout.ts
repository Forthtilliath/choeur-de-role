import { AppError } from '@/lib/appError';
import { createAdminClient } from '@/lib/supabase.server';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Enregistre une tentative ; renvoie la date de fin du verrou si le compte est bloqué
export async function registerLoginAttempt(email: string): Promise<Date | null> {
  const { data, error } = await createAdminClient().rpc('register_login_attempt', {
    p_email: normalizeEmail(email),
  });
  if (error) throw new AppError('DB_ERROR', 'Connexion momentanément indisponible.');
  return data ? new Date(data) : null;
}

export async function clearLoginAttempts(email: string): Promise<void> {
  const { error } = await createAdminClient().rpc('clear_login_attempts', {
    p_email: normalizeEmail(email),
  });
  if (error) throw new AppError('DB_ERROR', 'Connexion momentanément indisponible.');
}

export function lockoutMessage(lockedUntil: Date, now: Date = new Date()): string {
  const minutes = Math.max(1, Math.ceil((lockedUntil.getTime() - now.getTime()) / 60_000));
  return `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`;
}
