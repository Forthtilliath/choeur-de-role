import { createClient } from '@/lib/supabase.client';
import { SongFile, SongItem } from './types';

export async function upsertSong(
  payload: { title: string; composer: string | null; label: string | null; id?: string },
  performanceIds: string[],
): Promise<SongItem | null> {
  const supabase = createClient();
  let data, error;

  if (payload.id) {
    ({ data, error } = await supabase
      .from('songs')
      .update({ title: payload.title, composer: payload.composer, label: payload.label })
      .eq('id', payload.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from('songs')
      .insert({ title: payload.title, composer: payload.composer, label: payload.label })
      .select()
      .single());
  }

  if (error || !data) return null;

  // Sync performances
  await supabase.from('song_performance').delete().eq('song_id', data.id);
  if (performanceIds.length > 0) {
    await supabase
      .from('song_performance')
      .insert(performanceIds.map((pid) => ({ song_id: data.id, performance_id: pid })));
  }

  return data;
}

export async function deleteSong(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('songs').delete().eq('id', id);
  return !error;
}

export async function deleteSongFile(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('song_files').delete().eq('id', id);
  return !error;
}

async function uploadToR2(file: File, key: string): Promise<void> {
  const body = new FormData();
  body.append('file', file);
  body.append('key', key);

  const res = await fetch('/api/repertoire/upload-file', { method: 'POST', body });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Échec upload (${res.status})`);
  }
}

export async function uploadSongFile({
  songId,
  file,
  type,
  label,
  voicePartIds,
}: {
  songId: string;
  file: File;
  type: string;
  label: string;
  voicePartIds: string[];
}): Promise<SongFile> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const fileName = `songs/${songId}/${Date.now()}.${ext}`;

  await uploadToR2(file, fileName);
  const file_url = `r2://${fileName}`;

  const { data: existingFiles } = await supabase
    .from('song_files')
    .select('id')
    .eq('song_id', songId);
  const orderIndex = existingFiles?.length ?? 0;

  const { data, error } = await supabase
    .from('song_files')
    .insert({
      song_id: songId,
      file_url,
      type,
      label: label || null,
      order_index: orderIndex,
    })
    .select()
    .single();
  if (error) throw error;

  if (voicePartIds.length > 0) {
    await supabase
      .from('song_file_voice_part')
      .insert(voicePartIds.map((vp) => ({ song_file_id: data.id, voice_part_id: vp })));
  }

  return { ...data, song_file_voice_part: voicePartIds.map((vp) => ({ voice_part_id: vp })) };
}

export async function updateSongFile(
  fileId: string,
  songId: string,
  payload: { type: string; label: string | null; file_url: string },
  voicePartIds: string[],
  newFile?: File | null,
): Promise<SongFile | null> {
  const supabase = createClient();
  let file_url = payload.file_url;

  if (newFile) {
    const ext = newFile.name.split('.').pop();
    const fileName = `songs/${songId}/${Date.now()}.${ext}`;
    await uploadToR2(newFile, fileName);
    file_url = `r2://${fileName}`;
  }

  const { data, error } = await supabase
    .from('song_files')
    .update({
      label: payload.label,
      type: payload.type,
      file_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fileId)
    .select()
    .single();

  if (error || !data) return null;

  await supabase.from('song_file_voice_part').delete().eq('song_file_id', fileId);
  if (voicePartIds.length > 0) {
    await supabase
      .from('song_file_voice_part')
      .insert(voicePartIds.map((vp) => ({ song_file_id: fileId, voice_part_id: vp })));
  }

  return { ...data, song_file_voice_part: voicePartIds.map((vp) => ({ voice_part_id: vp })) };
}
