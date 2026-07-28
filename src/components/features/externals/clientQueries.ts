import { createClient } from '@/lib/supabase.client';
import { getCurrentTimestampString } from '@/lib/utils';
import { uploadDocToR2 } from '@/utils/uploadDocToR2';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import { ExternalEvent, ExternalEventDate, ExternalEventFile } from './types';

export async function toggleEventPublished(id: string, published: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('external_events').update({ published }).eq('id', id);
  return !error;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('external_events').delete().eq('id', id);
  return !error;
}

export async function upsertEvent(
  payload: {
    title: string;
    location: string | null;
    description: string | null;
    external_url: string | null;
    image_url: string | null;
  },
  id?: string,
): Promise<ExternalEvent | null> {
  const supabase = createClient();
  const base = { ...payload, updated_at: new Date().toISOString() };

  if (id) {
    const { data, error } = await supabase
      .from('external_events')
      .update(base)
      .eq('id', id)
      .select('*, external_event_dates (*), external_event_files (*)')
      .single();
    if (error) return null;
    return data as ExternalEvent;
  }

  const { data, error } = await supabase
    .from('external_events')
    .insert({ ...base, published: false })
    .select('*, external_event_dates (*), external_event_files (*)')
    .single();
  if (error) return null;
  return data as ExternalEvent;
}

export async function uploadEventImage(file: File): Promise<string | null> {
  try {
    return await uploadImageToR2(file, `events/${getCurrentTimestampString()}.webp`);
  } catch {
    return null;
  }
}

export async function replaceEventDates(
  eventId: string,
  dates: { date: string; end_date: string | null }[],
): Promise<ExternalEventDate[]> {
  const supabase = createClient();
  await supabase.from('external_event_dates').delete().eq('event_id', eventId);
  if (dates.length === 0) return [];
  const { data } = await supabase
    .from('external_event_dates')
    .insert(dates.map((d) => ({ event_id: eventId, date: d.date, end_date: d.end_date })))
    .select();
  return data ?? [];
}

export async function uploadEventFile(
  eventId: string,
  file: File,
  label: string,
  orderIndex: number,
): Promise<ExternalEventFile | null> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const key = `documents/events/${eventId}-${getCurrentTimestampString()}.${ext}`;

  const fileUrl = await uploadDocToR2(file, key).catch(() => null);
  if (!fileUrl) return null;

  const { data, error: dbError } = await supabase
    .from('external_event_files')
    .insert({ event_id: eventId, label, file_url: fileUrl, order_index: orderIndex })
    .select()
    .single();
  if (dbError) return null;
  return data;
}

export async function deleteEventFile(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('external_event_files').delete().eq('id', id);
  return !error;
}
