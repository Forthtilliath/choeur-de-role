import type { Json } from '@/types/database';
import { createAdminClient } from '@/lib/supabase.server';

export type AuditAction =
  | 'member_create'
  | 'member_update'
  | 'member_delete'
  | 'member_login'
  | 'password_reset'
  | 'password_reset_all'
  | 'email_change'
  | 'resend_invite'
  | 'member_locked'
  | 'member_unlocked';

export async function logAudit({
  actorId,
  action,
  targetId,
  details,
  ip,
}: {
  actorId: string;
  action: AuditAction;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action,
    target_id: targetId ?? null,
    details: (details ?? null) as Json | null,
    ip: ip ?? null,
  });
}
