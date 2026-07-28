import { Tables } from '@/types/database';
import { Merge } from '@/types/utils';

export type VoicePart = Tables<'voice_parts'>;

export type SongFile = Tables<'song_files'> & {
  song_file_voice_part: Pick<Tables<'song_file_voice_part'>, 'voice_part_id'>[];
};

export type SongItem = Tables<'songs'>;

export type Song = Merge<
  Tables<'songs'> & {
    song_files: SongFile[];
    song_performance: Pick<Tables<'song_performance'>, 'performance_id'>[];
  }
>;

export type Performance = Merge<
  Tables<'performances'> & {
    performance_dates: Pick<Tables<'performance_dates'>, 'date'>[];
    seasons: Pick<Tables<'seasons'>, 'label'> | null;
  }
>;

export type PerformanceFilter = {
  id: string;
  title: string;
  songIds: string[];
  minDate: string | null;
  notes: string | null;
  files: { id: string; label: string; file_url: string }[];
};

export type FileType = 'audio' | 'score' | 'lyrics';

export type MemberWithSeasons = {
  role: import('@/lib/roles').MemberRole;
  voice_part_id: string | null;
  member_seasons: string[];
};
