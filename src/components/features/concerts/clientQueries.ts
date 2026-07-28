// Queries client (mutations) — utilisées dans les composants 'use client'
import { createClient } from '@/lib/supabase.client';
import { getCurrentTimestampString } from '@/lib/utils';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import type { Season, PerformanceUpdate, Performance, PerformanceInsert } from './types';

// — Saisons —

export async function insertSeason(label: string): Promise<Season | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seasons')
    .insert({ label, active: false })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateSeasonLabel(id: string, label: string): Promise<Season | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seasons')
    .update({ label })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function toggleSeasonActive(id: string, active: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('seasons').update({ active }).eq('id', id);
  return !error;
}

export async function deleteSeason(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('seasons').delete().eq('id', id);
  return !error;
}

export async function deactivateSeasons(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const supabase = createClient();
  const { error } = await supabase.from('seasons').update({ active: false }).in('id', ids);
  return !error;
}

// — Performances —

export async function uploadPerformanceImage(file: File): Promise<string | null> {
  try {
    return await uploadImageToR2(file, `concerts/performances/${getCurrentTimestampString()}.webp`);
  } catch {
    return null;
  }
}

export async function upsertPerformance(
  payload: PerformanceUpdate | PerformanceInsert,
  id?: string,
): Promise<Performance | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('performances')
      .update(payload as PerformanceUpdate)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const { data, error } = await supabase
    .from('performances')
    .insert(payload as PerformanceInsert)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deletePerformance(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('performances').delete().eq('id', id);
  return !error;
}

export async function uploadRepresentationFile({
  performanceId,
  file,
  label,
}: {
  performanceId: string;
  file: File;
  label: string;
}): Promise<{ id: string; label: string; file_url: string } | null> {
  const ext = file.name.split('.').pop();
  const key = `representations/${performanceId}/${Date.now()}.${ext}`;

  const body = new FormData();
  body.append('file', file);
  body.append('key', key);
  const res = await fetch('/api/repertoire/upload-file', { method: 'POST', body });
  if (!res.ok) return null;

  const supabase = createClient();
  const { data: existing } = await supabase
    .from('representation_files')
    .select('id')
    .eq('performance_id', performanceId);
  const orderIndex = existing?.length ?? 0;

  const { data, error } = await supabase
    .from('representation_files')
    .insert({ performance_id: performanceId, file_url: `r2://${key}`, label, order_index: orderIndex })
    .select()
    .single();
  if (error || !data) return null;
  return { id: data.id, label: data.label, file_url: data.file_url };
}

export async function deleteRepresentationFile(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('representation_files').delete().eq('id', id);
  return !error;
}

export async function updatePerformanceNotes(id: string, notes: string | null): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('performances').update({ notes }).eq('id', id);
  return !error;
}

export async function replacePerformanceDates(performanceId: string, dates: string[]) {
  const supabase = createClient();
  await supabase.from('performance_dates').delete().eq('performance_id', performanceId);
  if (dates.length === 0) return [];
  const { data } = await supabase
    .from('performance_dates')
    .insert(dates.map((d) => ({ performance_id: performanceId, date: d })))
    .select();
  return data ?? [];
}
