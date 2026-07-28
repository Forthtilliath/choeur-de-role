import { AppError } from '@/lib/appError';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { BirthdayMember, CalendarEvent, EventType } from './types';

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`*, event_types (label, color, is_special)`)
    .order('starts_at');
  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des évènements.');
  return data as CalendarEvent[];
}

export async function getCalendarEventTypes(): Promise<EventType[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('event_types').select('*').order('order_index');
  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des types.');
  return data;
}

export async function getBirthdayMembers(): Promise<BirthdayMember[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, first_name, last_name, birthday, visibility_birthday, photo_url')
    .neq('visibility_birthday', 'none')
    .not('birthday', 'is', null);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des anniversaires.');
  return data;
}

export async function getBirthdayMembersAdmin(): Promise<BirthdayMember[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, first_name, last_name, birthday, visibility_birthday, photo_url')
    .not('birthday', 'is', null)
    .eq('is_test_account', false);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des anniversaires.');
  return data;
}

export async function getBirthdayCountsByMonth(): Promise<Record<number, number>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('birthday')
    .not('birthday', 'is', null)
    .eq('is_test_account', false);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des anniversaires.');

  const counts: Record<number, number> = {};
  for (const m of data) {
    if (m.birthday) {
      const month = parseInt(m.birthday.split('-')[1], 10) - 1;
      counts[month] = (counts[month] ?? 0) + 1;
    }
  }
  return counts;
}
