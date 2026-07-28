import { createClient } from '@/lib/supabase.client';
import { CaMeeting } from './types';

export async function toggleMeetingPublished(id: string, published: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('ca_meetings').update({ published }).eq('id', id);
  return !error;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('ca_meetings').delete().eq('id', id);
  return !error;
}

export async function upsertMeeting(
  payload: {
    title: string;
    meeting_date: string;
    content: string;
    pdf_url: string | null;
  },
  id?: string,
): Promise<CaMeeting | null> {
  const supabase = createClient();
  const base = { ...payload, updated_at: new Date().toISOString() };

  if (id) {
    const { data, error } = await supabase
      .from('ca_meetings')
      .update(base)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }

  const { data, error } = await supabase
    .from('ca_meetings')
    .insert({ ...base, published: false })
    .select()
    .single();
  if (error) return null;
  return data;
}
