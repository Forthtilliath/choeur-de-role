import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export type Notification = {
  type: 'repertoire' | 'liens' | 'ca' | 'calendrier' | 'galerie';
  label: string;
  count: number;
  href: string;
};

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  try {
    const { data: member } = await supabase
      .from('members')
      .select('last_login_at, voice_part_id')
      .eq('id', user.id)
      .single();

    const since = member?.last_login_at ?? null;

    await supabase
      .from('members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!since || !member) return NextResponse.json([]);
    const notifications: Notification[] = [];

    if (member.voice_part_id) {
      const { data: newFiles } = await supabase
        .from('song_files')
        .select('id, song_file_voice_part!inner(voice_part_id)')
        .gt('created_at', since)
        .eq('song_file_voice_part.voice_part_id', member.voice_part_id);

      const { data: allFiles } = await supabase
        .from('song_files')
        .select('id, song_file_voice_part(voice_part_id)')
        .gt('created_at', since);

      const globalFiles = (allFiles ?? []).filter((f) => f.song_file_voice_part.length === 0);
      const total = (newFiles?.length ?? 0) + globalFiles.length;

      if (total > 0) {
        notifications.push({
          type: 'repertoire',
          label: `${total} nouveau${total > 1 ? 'x' : ''} fichier${total > 1 ? 's' : ''} dans le répertoire`,
          count: total,
          href: '/choristes/repertoire',
        });
      }
    }

    const { data: newLinks } = await supabase
      .from('member_links')
      .select('id')
      .gt('created_at', since)
      .eq('active', true);

    if ((newLinks?.length ?? 0) > 0) {
      notifications.push({
        type: 'liens',
        label: `${newLinks!.length} nouveau${newLinks!.length > 1 ? 'x' : ''} lien${newLinks!.length > 1 ? 's' : ''}`,
        count: newLinks!.length,
        href: '/choristes/liens',
      });
    }

    const { data: newCa } = await supabase
      .from('ca_meetings')
      .select('id')
      .gt('updated_at', since)
      .eq('published', true);

    if ((newCa?.length ?? 0) > 0) {
      notifications.push({
        type: 'ca',
        label: `${newCa!.length} compte${newCa!.length > 1 ? 's' : ''}-rendu CA mis à jour`,
        count: newCa!.length,
        href: '/choristes/ca',
      });
    }

    const { data: newEvents } = await supabase
      .from('calendar_events')
      .select('id')
      .gt('created_at', since);

    if ((newEvents?.length ?? 0) > 0) {
      notifications.push({
        type: 'calendrier',
        label: `${newEvents!.length} nouvel${newEvents!.length > 1 ? 's' : ''} évènement${newEvents!.length > 1 ? 's' : ''} au calendrier`,
        count: newEvents!.length,
        href: '/choristes/calendrier',
      });
    }

    const { data: newAlbums } = await supabase
      .from('gallery_albums')
      .select('id')
      .gt('created_at', since)
      .eq('published', true);

    if ((newAlbums?.length ?? 0) > 0) {
      notifications.push({
        type: 'galerie',
        label: `${newAlbums!.length} nouvel${newAlbums!.length > 1 ? 's' : ''} album${newAlbums!.length > 1 ? 's' : ''} dans la galerie`,
        count: newAlbums!.length,
        href: '/choristes/galerie',
      });
    }

    return NextResponse.json(notifications);
  } catch (e) {
    return toApiError(e);
  }
}
