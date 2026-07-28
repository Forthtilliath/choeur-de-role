import { createClient } from '@/lib/supabase.client';
import { getCurrentTimestampString } from '@/lib/utils';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import type { GalleryAlbum, GalleryPhoto } from './types';

// — Albums —

export async function addAlbum(title: string, orderIndex: number): Promise<GalleryAlbum | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({ title, order_index: orderIndex, published: false })
    .select(`*, gallery_photos (*), gallery_videos (*), performances!performance_id (title)`)
    .single();
  if (error) return null;
  return { ...data, gallery_photos: [], gallery_videos: [] };
}

export async function updateAlbumFields(
  id: string,
  fields: Partial<Pick<GalleryAlbum, 'title' | 'description' | 'performance_id'>>,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('gallery_albums').update(fields).eq('id', id);
  return !error;
}

export async function toggleAlbumPublished(id: string, published: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('gallery_albums').update({ published }).eq('id', id);
  return !error;
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
  return !error;
}

export async function updateAlbumsOrder(
  albums: { id: string; order_index: number }[],
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    albums.map((a) =>
      supabase.from('gallery_albums').update({ order_index: a.order_index }).eq('id', a.id),
    ),
  );
}

export async function uploadAlbumCover(id: string, file: File): Promise<string | null> {
  const supabase = createClient();
  try {
    const publicUrl = await uploadImageToR2(file, `gallery/covers/${id}.webp`);
    await supabase.from('gallery_albums').update({ cover_url: publicUrl }).eq('id', id);
    return publicUrl;
  } catch {
    return null;
  }
}

export async function removeAlbumCover(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('gallery_albums').update({ cover_url: null }).eq('id', id);
  return !error;
}

// — Photos —

export async function uploadPhotos(albumId: string, files: File[]): Promise<GalleryPhoto[]> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from('gallery_photos')
    .select('id')
    .eq('album_id', albumId);
  let nextOrder = existing?.length ?? 0;

  const uploaded: GalleryPhoto[] = [];

  for (const [idx, file] of Array.from(files).entries()) {
    try {
      const publicUrl = await uploadImageToR2(
        file,
        `gallery/photos/${albumId}-${getCurrentTimestampString()}-${idx}.webp`,
      );
      const { data: photo, error: dbError } = await supabase
        .from('gallery_photos')
        .insert({ album_id: albumId, url: publicUrl, order_index: nextOrder++ })
        .select()
        .single();
      if (!dbError && photo) uploaded.push(photo);
    } catch {
      continue;
    }
  }

  return uploaded;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
  return !error;
}

export async function updatePhotosOrder(
  photos: { id: string; order_index: number }[],
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    photos.map((p) =>
      supabase.from('gallery_photos').update({ order_index: p.order_index }).eq('id', p.id),
    ),
  );
}

export async function updatePhotoCaption(id: string, caption: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('gallery_photos').update({ caption }).eq('id', id);
}
