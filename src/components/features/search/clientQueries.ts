import { createClient } from '@/lib/supabase.client';

export type SearchMember = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  voice_parts: { name: string } | null;
};

export type SearchSong = { id: string; title: string };
export type SearchPerformance = { id: string; title: string; slug: string | null };
export type SearchNews = { id: string; title: string };
export type SearchEvent = { id: string; title: string; starts_at: string };

export type PublicSearchData = {
  performances: SearchPerformance[];
  news: SearchNews[];
};

export type MemberSearchData = {
  members: SearchMember[];
  songs: SearchSong[];
  events: SearchEvent[];
};

// Concerts et actualités publiées — lisibles par tout le monde (RLS "readable by all"),
// donc à charger même pour un visiteur non connecté.
export async function fetchPublicSearchData(): Promise<PublicSearchData> {
  const supabase = createClient();
  const [perfsRes, newsRes] = await Promise.all([
    supabase.from('performances').select('id, title, slug'),
    supabase.from('news').select('id, title').eq('published', true),
  ]);

  return {
    performances: perfsRes.data ?? [],
    news: newsRes.data ?? [],
  };
}

// Choristes, chants, calendrier interne — réservé aux membres connectés (RLS restreinte).
export async function fetchMemberSearchData(): Promise<MemberSearchData> {
  const supabase = createClient();
  const [membersRes, songsRes, eventsRes] = await Promise.all([
    supabase.from('members').select('id, first_name, last_name, voice_parts(name)'),
    supabase.from('songs').select('id, title'),
    supabase.from('calendar_events').select('id, title, starts_at'),
  ]);

  return {
    members: (membersRes.data ?? []) as SearchMember[],
    songs: songsRes.data ?? [],
    events: eventsRes.data ?? [],
  };
}
