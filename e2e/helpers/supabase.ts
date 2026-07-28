import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test.local');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createTestMember(params: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<string> {
  const supabase = adminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      first_name: params.firstName ?? 'Test',
      last_name: params.lastName ?? 'E2E',
    },
  });
  if (error) throw new Error(`createUser failed: ${error.message}`);

  const userId = data.user.id;

  // La DB crée automatiquement la ligne members via trigger.
  // On la complète et on marque l'onboarding comme fait pour éviter
  // la redirection vers /choristes/bienvenue pendant les tests.
  await supabase
    .from('members')
    .update({
      first_name: params.firstName ?? 'Test',
      last_name: params.lastName ?? 'E2E',
      email: params.email,
      onboarded_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Inscrire à la saison active pour éviter la redirection vers /non-inscrit
  const { data: activeSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('active', true)
    .limit(1)
    .maybeSingle();
  if (activeSeason) {
    await supabase
      .from('member_season')
      .insert({ member_id: userId, season_id: activeSeason.id });
  }

  return userId;
}

export async function deleteTestMember(userId: string): Promise<void> {
  const supabase = adminClient();
  await supabase.auth.admin.deleteUser(userId);
}
