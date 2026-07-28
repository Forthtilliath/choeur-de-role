// ⚠️ Ce fichier contient des queries SERVEUR — ne pas importer côté client
// TODO: A vérifier une fois galerie refactoré
import type { GalleryAlbum } from '@/components/features/galerie';
import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import type {
  PerformanceDatesWithSeasons,
  PerformanceTitle,
  PerformanceWithDates,
  Season,
  SeasonWithPerformancesWithDates,
} from './types';

// — Performances —

export async function getPerformancesQuery(): Promise<PerformanceDatesWithSeasons[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select(`*, performance_dates (*), seasons (label)`)
    .order('created_at', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des performances.');
  if (!Array.isArray(data)) throw new AppError('INVALID_DATA', 'Format de données invalide.');
  return data;
}

export async function getPerformancesFromSlugQuery(
  slug: string,
): Promise<PerformanceDatesWithSeasons> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select(`*, performance_dates (*), seasons (label)`)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('NOT_FOUND', 'Concert non trouvé.');
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération du concert.');
  }
  return data;
}

export async function getOrphanPerformancesQuery(): Promise<PerformanceWithDates[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select(`*, performance_dates (*)`)
    .is('season_id', null);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des performances.');
  if (!Array.isArray(data)) throw new AppError('INVALID_DATA', 'Format de données invalide.');
  return data;
}

export async function getPerformancesTitleQuery(): Promise<PerformanceTitle[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('performances').select('id, title').order('title');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des performances.');
  if (!Array.isArray(data)) throw new AppError('INVALID_DATA', 'Format de données invalide.');
  return data;
}

export async function getPerformancesWithSeasons(): Promise<PerformanceDatesWithSeasons[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select('*, seasons (label), performance_dates (*)')
    .order('created_at', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des performances.');
  return data;
}

export async function getAlbumsForPerformance(performanceId: string): Promise<GalleryAlbum[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select(`*, gallery_photos (*), gallery_videos (*), performances (title)`)
    .eq('performance_id', performanceId)
    .eq('published', true)
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des albums.');
  if (!Array.isArray(data)) throw new AppError('INVALID_DATA', 'Format de données invalide.');
  return data as GalleryAlbum[];
}

// Utilisée aussi par le répertoire
export async function getPerformanceFromSeasons(seasonIds: string[]) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('performances')
    .select(
      `
      id, title, notes,
      performance_dates (date),
      representation_files (id, label, file_url, order_index),
      songs:song_performance (
        song:songs (
          *,
          song_files (*, song_file_voice_part (voice_part_id)),
          song_performance (performance_id)
        )
      )
    `,
    )
    .in('season_id', seasonIds.length > 0 ? seasonIds : [''])
    .order('created_at', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des performances.');
  return data;
}

// — Sitemap —

export async function getSitemapPerformances(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('performances')
    .select('slug, updated_at')
    .order('created_at', { ascending: false });
  return (data ?? []).filter((p): p is { slug: string; updated_at: string | null } => p.slug !== null);
}

// — Saisons —

export async function getSeasonsWithPerformancesQuery(): Promise<
  SeasonWithPerformancesWithDates[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('seasons')
    .select(`*, performances (*, performance_dates (*))`)
    .order('label', { ascending: false });

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des saisons.');
  }

  return data;
}

export async function getSeasonsQuery(): Promise<Season[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('seasons')
    .select(`*`)
    .order('label', { ascending: false });

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des saisons.');
  }

  return data;
}
