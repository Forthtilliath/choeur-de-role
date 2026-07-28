import { createAdminClient, createServerClient } from '@/lib/supabase.server';

// Used by proxy.ts which creates its own Supabase client with middleware cookie handling.
// These functions accept an external client instead of creating one.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProxyClient = { from: (table: string) => any };

export type MemberOnboarding = {
  role: string;
  onboarded_at: string | null;
  admin_onboarded_at: string | null;
};

export type MemberAdminOnboarding = {
  role: string;
  admin_onboarded_at: string | null;
};

export async function getMemberOnboarding(
  supabase: ProxyClient,
  userId: string,
): Promise<MemberOnboarding | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('members') as any)
    .select('role, onboarded_at, admin_onboarded_at')
    .eq('id', userId)
    .single();
  return data as MemberOnboarding | null;
}

export async function getMemberAdminOnboarding(
  supabase: ProxyClient,
  userId: string,
): Promise<MemberAdminOnboarding | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('members') as any)
    .select('role, admin_onboarded_at')
    .eq('id', userId)
    .single();
  return data as MemberAdminOnboarding | null;
}

// — API route helpers (create their own server client) —

export async function getMemberRole(userId: string): Promise<string | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('members').select('role').eq('id', userId).single();
  return data?.role ?? null;
}

export async function getMemberEmailAndFirstName(
  memberId: string,
): Promise<{ email: string | null; first_name: string | null } | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('members')
    .select('email, first_name')
    .eq('id', memberId)
    .single();
  return data ?? null;
}

export async function getMemberFirstName(
  memberId: string,
): Promise<{ first_name: string | null } | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('members')
    .select('first_name')
    .eq('id', memberId)
    .single();
  return data ?? null;
}

export async function updateMemberEmail(memberId: string, email: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('members').update({ email }).eq('id', memberId);
  return !error;
}

export async function getMemberForLoginAlert(
  userId: string,
): Promise<{ first_name: string | null; last_name: string | null; email: string | null } | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('members')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export async function getAdminEmails(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('members')
    .select('email')
    .in('role', ['admin', 'super_admin']);
  return (data ?? []).map((a) => a.email).filter((e): e is string => !!e);
}

export async function getLastLoginCountry(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('audit_logs')
    .select('details')
    .eq('user_id', userId)
    .eq('action', 'member_login')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.details as Record<string, unknown> | null)?.country as string | null;
}
