import { AppError } from '@/lib/appError';
import { isValidDbRole } from '@/lib/roles';
import { getUserQuery } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import { sortByOrderIndex } from '@/utils/arrayHelpers';
import { MemberWithSeasons, Song } from './types';

export async function getSongsWithFiles(): Promise<Song[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('songs')
    .select(
      `*, song_files (*, song_file_voice_part (voice_part_id)), song_performance (performance_id)`,
    )
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des chansons.');
  if (!Array.isArray(data)) throw new AppError('INVALID_DATA', 'Format de données invalide.');
  return data as Song[];
}

export async function getSongsForMember(seasonIds: string[]): Promise<Song[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select(
      `
      *,
      songs:song_performance (
        song:songs (
          *,
          song_files (*, song_file_voice_part (voice_part_id)),
          song_performance (performance_id)
        )
      )
    `,
    )
    .in('season_id', seasonIds.length > 0 ? seasonIds : ['']);

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des chansons.');
  }

  const songsMap = new Map<string, Song>();
  data.forEach((perf) => {
    perf.songs.forEach((sp) => {
      if (sp.song) songsMap.set(sp.song.id, sp.song as Song);
    });
  });

  return sortByOrderIndex(Array.from(songsMap.values()));
}

export async function getSongFileById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('song_files')
    .select('*, songs(title)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

export async function getMemberWithSeasons(): Promise<MemberWithSeasons> {
  const userRoleInfo = await getUserQuery();
  if (!userRoleInfo.isLoggedIn) throw new AppError('UNAUTHORIZED', 'Non connecté');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('members')
    .select('role, voice_part_id, member_season (season_id)')
    .eq('id', userRoleInfo.id)
    .single();

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération du membre.');
  if (!isValidDbRole(data.role)) throw new AppError('INVALID_DATA', 'Rôle invalide.');

  return {
    role: data.role,
    voice_part_id: data.voice_part_id,
    member_seasons: data.member_season
      .filter((ms): ms is { season_id: string } => ms.season_id !== null)
      .map((ms) => ms.season_id),
  };
}
