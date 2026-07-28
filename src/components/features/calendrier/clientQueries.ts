import { createClient } from '@/lib/supabase.client';
import { CalendarEvent, EventType } from './types';

const SELECT = `*, event_types (label, color, is_special)`;

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('calendar_events').delete().eq('id', id);
  return !error;
}

export async function upsertCalendarEvent(
  payload: {
    title: string;
    event_type_id: string;
    starts_at: string;
    ends_at: string;
    location: string | null;
    description: string | null;
  },
  id?: string,
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(payload)
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) return null;
    return data as CalendarEvent;
  }
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(payload)
    .select(SELECT)
    .single();
  if (error) return null;
  return data as CalendarEvent;
}

export async function insertRecurringEvents(
  rows: {
    title: string;
    event_type_id: string;
    starts_at: string;
    ends_at: string;
    location: string | null;
    description: string | null;
    series_id: string;
  }[],
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('calendar_events').insert(rows).select(SELECT);
  if (error) return [];
  return data as CalendarEvent[];
}

export async function updateSeriesEvents(
  seriesId: string,
  fromStartsAt: string,
  payload: {
    title: string;
    event_type_id: string;
    location: string | null;
    description: string | null;
  },
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('calendar_events')
    .update(payload)
    .eq('series_id', seriesId)
    .gte('starts_at', fromStartsAt);
  return !error;
}

export async function upsertEventType(
  payload: { label: string; color: string; is_special: boolean; description?: string | null },
  id?: string,
  orderIndex?: number,
): Promise<EventType | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('event_types')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const { data, error } = await supabase
    .from('event_types')
    .insert({ ...payload, order_index: orderIndex ?? 0 })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteEventType(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('event_types').delete().eq('id', id);
  return !error;
}

export async function updateEventTypesOrder(
  items: { id: string; order_index: number }[],
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    items.map((et) =>
      supabase.from('event_types').update({ order_index: et.order_index }).eq('id', et.id),
    ),
  );
}
