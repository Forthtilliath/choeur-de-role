import { createAdminClient, createServerClient } from '@/lib/supabase.server';

export type AuditLogEntry = {
  id: string;
  action: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
  user_id: string | null;
  actor_name: string | null;
  target_name: string | null;
};

export type VoicePartStat = { name: string; count: number };

export type CurrentSeasonStats = {
  label: string;
  choristes: number;
  representations: number;
  chants: number;
  byVoicePart: VoicePartStat[];
};

export type DashboardStats = {
  members: { total: number };
  concerts: { upcomingDates: number };
  repertoire: { songs: number; files: number };
  galerie: { albums: number; photos: number };
  news: { published: number; drafts: number };
  polls: { active: number };
  currentSeason: CurrentSeasonStats | null;
  auditLogs: AuditLogEntry[];
};

export const AUDIT_PAGE_SIZE = 25;
export const AUDIT_SERVER_LIMIT = 500;

export async function getAllAuditLogs(): Promise<{ logs: AuditLogEntry[]; hasMore: boolean }> {
  const admin = createAdminClient();
  const supabase = await createServerClient();

  try {
    const supabaseForFilter = await createServerClient();
    const { data: testMembers } = await supabaseForFilter
      .from('members')
      .select('id')
      .eq('is_test_account', true);
    const testIds = (testMembers ?? []).map((m) => m.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let logsQuery = (admin as any)
      .from('audit_logs')
      .select('id, action, target_id, details, ip, created_at, user_id')
      .neq('action', 'member_login')
      .order('created_at', { ascending: false })
      .limit(AUDIT_SERVER_LIMIT + 1);
    if (testIds.length > 0) {
      logsQuery = logsQuery.not('user_id', 'in', `(${testIds.join(',')})`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawLogs } = await (logsQuery as any);

    if (!rawLogs?.length) return { logs: [], hasMore: false };

    const hasMore = rawLogs.length > AUDIT_SERVER_LIMIT;
    const sliced = hasMore ? rawLogs.slice(0, AUDIT_SERVER_LIMIT) : rawLogs;

    const userIds = [
      ...new Set(
        (sliced as { user_id: string | null }[])
          .map((l) => l.user_id)
          .filter((id): id is string => id !== null),
      ),
    ];

    const targetIds = [
      ...new Set(
        (sliced as { target_id: string | null }[])
          .map((l) => l.target_id)
          .filter((id): id is string => id !== null),
      ),
    ];

    const allIds = [...new Set([...userIds, ...targetIds])];
    const memberMap = new Map<string, string>();
    if (allIds.length > 0) {
      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .in('id', allIds);
      data?.forEach((m) => memberMap.set(m.id, `${m.first_name} ${m.last_name}`));
    }

    const logs = (sliced as Record<string, unknown>[]).map((log) => ({
      id: log.id as string,
      action: log.action as string,
      target_id: (log.target_id as string | null) ?? null,
      details: (log.details as Record<string, unknown> | null) ?? null,
      ip: (log.ip as string | null) ?? null,
      created_at: log.created_at as string,
      user_id: (log.user_id as string | null) ?? null,
      actor_name: log.user_id ? (memberMap.get(log.user_id as string) ?? null) : null,
      target_name: log.target_id ? (memberMap.get(log.target_id as string) ?? null) : null,
    }));

    return { logs, hasMore };
  } catch {
    return { logs: [], hasMore: false };
  }
}

async function getCurrentSeasonStats(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
): Promise<CurrentSeasonStats | null> {
  const { data: season } = await supabase
    .from('seasons')
    .select('id, label')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!season) return null;

  const [choristesResult, performancesResult, membersVoiceParts, allVoiceParts] = await Promise.all([
    supabase
      .from('member_season')
      .select('*', { count: 'exact', head: true })
      .eq('season_id', season.id),
    supabase
      .from('performances')
      .select('id')
      .eq('season_id', season.id),
    supabase
      .from('member_season')
      .select('members!inner(voice_part_id, voice_parts(id, name, order_index))')
      .eq('season_id', season.id),
    supabase
      .from('voice_parts')
      .select('id, name, order_index')
      .eq('is_voice_part', true)
      .order('order_index', { ascending: true }),
  ]);

  const perfIds = (performancesResult.data ?? []).map((p) => p.id);

  let chants = 0;
  if (perfIds.length > 0) {
    const { data: songPerfs } = await supabase
      .from('song_performance')
      .select('song_id')
      .in('performance_id', perfIds);
    chants = new Set((songPerfs ?? []).map((sp) => sp.song_id)).size;
  }

  const voicePartCounts = new Map<string, number>();
  for (const row of membersVoiceParts.data ?? []) {
    const member = row.members as { voice_part_id: string | null; voice_parts: { id: string } | null } | null;
    const vpId = member?.voice_parts?.id;
    if (!vpId) continue;
    voicePartCounts.set(vpId, (voicePartCounts.get(vpId) ?? 0) + 1);
  }

  const byVoicePart = (allVoiceParts.data ?? []).map((vp) => ({
    name: vp.name,
    count: voicePartCounts.get(vp.id) ?? 0,
  }));

  return {
    label: season.label,
    choristes: choristesResult.count ?? 0,
    representations: perfIds.length,
    chants,
    byVoicePart,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    membersResult,
    upcomingDatesResult,
    songsResult,
    filesResult,
    albumsResult,
    photosResult,
    publishedNewsResult,
    draftNewsResult,
    pollsResult,
    currentSeason,
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_test_account', false),
    supabase.from('performance_dates').select('*', { count: 'exact', head: true }).gte('date', today),
    supabase.from('songs').select('*', { count: 'exact', head: true }),
    supabase.from('song_files').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_albums').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('gallery_photos').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', false),
    supabase.from('polls').select('*', { count: 'exact', head: true }).eq('is_active', true),
    getCurrentSeasonStats(supabase),
  ]);

  const { logs: allLogs } = await getAllAuditLogs();
  const auditLogs = allLogs.slice(0, 8);

  return {
    members: { total: membersResult.count ?? 0 },
    concerts: { upcomingDates: upcomingDatesResult.count ?? 0 },
    repertoire: { songs: songsResult.count ?? 0, files: filesResult.count ?? 0 },
    galerie: { albums: albumsResult.count ?? 0, photos: photosResult.count ?? 0 },
    news: { published: publishedNewsResult.count ?? 0, drafts: draftNewsResult.count ?? 0 },
    polls: { active: pollsResult.count ?? 0 },
    currentSeason,
    auditLogs,
  };
}
