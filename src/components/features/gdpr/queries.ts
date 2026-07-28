import { createAdminClient, createServerClient } from '@/lib/supabase.server';

type RawOption = { id: string; label: string };
type RawQuestion = { id: string; text: string; type: string; poll_options: RawOption[] };
type RawPoll = { id: string; title: string; poll_questions: RawQuestion[] };
type RawAnswer = {
  question_id: string;
  option_id: string | null;
  text_value: string | null;
  number_value: number | null;
};

export type GdprExportData = {
  date_export: string;
  profil: Record<string, unknown> | null;
  saisons: string[];
  sondages: unknown[];
  journal_activite: unknown[];
};

export async function getMemberGdprData(memberId: string): Promise<GdprExportData> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const [profileRes, responsesRes, seasonIdsRes, auditRes] = await Promise.all([
    supabase
      .from('members')
      .select('*, voice_parts!members_voice_part_id_fkey(name, group_name)')
      .eq('id', memberId)
      .single(),
    supabase
      .from('poll_responses')
      .select('id, submitted_at, poll_id, poll_answers(*)')
      .eq('member_id', memberId)
      .order('submitted_at', { ascending: false }),
    supabase.from('member_season').select('season_id').eq('member_id', memberId),
    admin
      .from('audit_logs')
      .select('action, details, ip, created_at')
      .eq('user_id', memberId)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const pollIds = [
    ...new Set(
      (responsesRes.data ?? [])
        .map((r: { poll_id: string }) => r.poll_id)
        .filter(Boolean),
    ),
  ];
  const seasonIds = (seasonIdsRes.data ?? [])
    .map((s: { season_id: string | null }) => s.season_id)
    .filter((id): id is string => id !== null);

  const [pollsRes, seasonsRes] = await Promise.all([
    pollIds.length > 0
      ? supabase
          .from('polls')
          .select('id, title, poll_questions(id, text, type, poll_options(id, label))')
          .in('id', pollIds)
      : Promise.resolve({ data: [] as RawPoll[] }),
    seasonIds.length > 0
      ? supabase.from('seasons').select('id, label').in('id', seasonIds)
      : Promise.resolve({ data: [] as { id: string; label: string }[] }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pollMap = new Map<string, RawPoll>((pollsRes.data ?? []).map((p: any) => [p.id as string, p as RawPoll]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRes.data as any;

  return {
    date_export: new Date().toISOString(),
    profil: profile
      ? {
          prenom: profile.first_name,
          nom: profile.last_name,
          email: profile.email,
          telephone: profile.phone,
          adresse: profile.address,
          code_postal: profile.zip_code,
          ville: profile.city,
          date_naissance: profile.birthday,
          photo_url: profile.photo_url,
          pupitre: profile.voice_parts?.name ?? null,
          groupe_pupitre: profile.voice_parts?.group_name ?? null,
          role: profile.role,
          visibilite: {
            email: profile.visibility_email,
            telephone: profile.visibility_phone,
            adresse: profile.visibility_address,
            anniversaire: profile.visibility_birthday,
          },
          inscrit_le: profile.created_at,
          derniere_connexion: profile.last_login_at,
        }
      : null,
    saisons: (seasonsRes.data ?? []).map((s: { label: string }) => s.label),
    sondages: (responsesRes.data ?? []).map(
      (r: { poll_id: string; submitted_at: string; poll_answers: RawAnswer[] }) => {
        const poll = pollMap.get(r.poll_id);
        const questionsById = new Map((poll?.poll_questions ?? []).map((q) => [q.id, q]));
        const optionsById = new Map(
          (poll?.poll_questions ?? [])
            .flatMap((q) => q.poll_options ?? [])
            .map((o) => [o.id, o.label]),
        );
        return {
          sondage: poll?.title ?? r.poll_id,
          repondu_le: r.submitted_at,
          reponses: (r.poll_answers ?? []).map((a) => {
            const question = questionsById.get(a.question_id);
            return {
              question: question?.text ?? a.question_id,
              type: question?.type ?? null,
              reponse:
                a.text_value ??
                (a.number_value !== null ? a.number_value : null) ??
                (a.option_id ? (optionsById.get(a.option_id) ?? a.option_id) : null),
            };
          }),
        };
      },
    ),
    journal_activite: (auditRes.data ?? []).map(
      (e: { action: string; details: unknown; ip: string | null; created_at: string }) => ({
        action: e.action,
        details: e.details,
        ip: e.ip,
        date: e.created_at,
      }),
    ),
  };
}
