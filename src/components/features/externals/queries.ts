import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { ExternalEvent } from './types';

const SELECT = `*, external_event_dates (*), external_event_files (*)`;

export async function getSitemapExternalEvents(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('external_events')
    .select('slug, updated_at')
    .eq('published', true);
  return (data ?? []).filter((e): e is { slug: string; updated_at: string | null } => e.slug !== null);
}

export async function getExternalEventsQuery(): Promise<ExternalEvent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('external_events')
    .select(SELECT)
    .eq('published', true)
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des évènements.');
  return data;
}

export async function getExternalEventsAdminQuery(): Promise<ExternalEvent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('external_events')
    .select(SELECT)
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des évènements.');
  return data;
}

export async function getExternalEventBySlugQuery(slug: string): Promise<ExternalEvent> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('external_events')
    .select(`*, external_event_dates (*), external_event_files (*)`)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('NOT_FOUND', 'Évènement introuvable.');
    throw new AppError('DB_ERROR', "Erreur lors de la récupération de l'évènement.");
  }
  return data as ExternalEvent;
}
