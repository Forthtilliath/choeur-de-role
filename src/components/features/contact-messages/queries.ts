import { createAdminClient } from '@/lib/supabase.server';
import type { ContactMessage } from './actions';

export async function getContactMessagesQuery(): Promise<ContactMessage[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('id, category, first_name, last_name, email, phone, message, read, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as ContactMessage[];
}

export async function updateContactMessageRead(id: string, read: boolean): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('contact_messages').update({ read }).eq('id', id);
}

export async function deleteContactMessageById(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('contact_messages').delete().eq('id', id);
}
