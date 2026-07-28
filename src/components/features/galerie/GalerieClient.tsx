'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const GalerieLightbox = dynamic(() => import('./GalerieLightbox').then(m => m.GalerieLightbox), { ssr: false });
import { sortByOrderIndex } from '@/utils/arrayHelpers';
import { VideoCard } from './VideoCard';
import { GalleryAlbum } from './types';

type Props = {
  albums: GalleryAlbum[];
  canEdit?: boolean;
};

const MAX_VISIBLE_PHOTOS = 11;

export function GalerieClient({ albums, canEdit = false }: Props) {
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());

  function toggleAlbum(id: string) {
    setExpandedAlbums((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openLightbox(album: GalleryAlbum, index: number) {
    setLightboxAlbum(album);
    setLightboxIndex(index);
  }

  return (
    <>
      <div className="flex flex-col gap-8 md:gap-12">
        {albums.map((album) => {
          const isExpanded = expandedAlbums.has(album.id);
          const sortedPhotos = sortByOrderIndex(album.gallery_photos);
          const sortedVideos = sortByOrderIndex(album.gallery_videos);
          const visiblePhotos = isExpanded
            ? sortedPhotos
            : sortedPhotos.slice(0, MAX_VISIBLE_PHOTOS);
          const hasMore = sortedPhotos.length > MAX_VISIBLE_PHOTOS;
          const hasVideos = sortedVideos.length > 0;
          const hasPhotos = sortedPhotos.length > 0;

          return (
            <section key={album.id}>
              {/* Header album */}
              <div className="flex items-center gap-4 mb-6">
                {album.cover_url && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={album.cover_url}
                      alt={album.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-foreground">{album.title}</h2>
                    {canEdit && (
                      <Link
                        href={`/choristes/admin/galerie?album=${album.id}`}
                        className="text-xs text-foreground/30 hover:text-primary transition-colors no-underline shrink-0"
                        aria-label={`Modifier l'album ${album.title}`}
                      >
                        ⚙️
                      </Link>
                    )}
                    {hasVideos && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 font-medium">
                        🎬 {sortedVideos.length} vidéo{sortedVideos.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {album.performances && (
                      <span className="text-xs text-foreground/50">{album.performances.title}</span>
                    )}
                    {album.performances && album.description && (
                      <span className="text-foreground/30">·</span>
                    )}
                    {album.description && (
                      <span className="text-xs text-foreground/50">{album.description}</span>
                    )}
                    {hasPhotos && (
                      <>
                        <span className="text-foreground/30">·</span>
                        <span className="text-xs text-foreground/40">
                          {sortedPhotos.length} photo{sortedPhotos.length > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Section vidéos */}
              {hasVideos && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                  {hasPhotos && <div className="border-t border-border mt-6 mb-6" />}
                </div>
              )}

              {/* Section photos */}
              {hasPhotos ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {visiblePhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => openLightbox(album, index)}
                        aria-label={`Ouvrir la photo${photo.caption ? ` : ${photo.caption}` : ` ${index + 1} de ${album.title}`}`}
                        className="relative aspect-square rounded-xl overflow-hidden bg-background-secondary hover:opacity-90 transition-opacity group"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption ?? album.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        {photo.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs">{photo.caption}</p>
                          </div>
                        )}
                      </button>
                    ))}
                    {!isExpanded && hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleAlbum(album.id)}
                        aria-label={`Voir ${sortedPhotos.length - MAX_VISIBLE_PHOTOS} photos supplémentaires`}
                        className="relative aspect-square rounded-xl overflow-hidden bg-background-tertiary hover:bg-primary/10 transition-colors flex items-center justify-center border border-border"
                      >
                        <div className="text-center">
                          <p className="text-2xl font-medium text-foreground/60">
                            +{sortedPhotos.length - MAX_VISIBLE_PHOTOS}
                          </p>
                          <p className="text-xs text-foreground/40 mt-1">photos</p>
                        </div>
                      </button>
                    )}
                  </div>
                  {isExpanded && hasMore && (
                    <button
                      type="button"
                      onClick={() => toggleAlbum(album.id)}
                      className="mt-4 text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      Voir moins ↑
                    </button>
                  )}
                </>
              ) : !hasVideos ? (
                <p className="text-sm text-foreground/40">Aucun contenu dans cet album.</p>
              ) : null}
            </section>
          );
        })}
      </div>

      {lightboxAlbum && (
        <GalerieLightbox
          open={!!lightboxAlbum}
          onCloseAction={() => setLightboxAlbum(null)}
          index={lightboxIndex}
          slides={sortByOrderIndex(lightboxAlbum.gallery_photos).map((photo) => ({
            src: photo.url,
            alt: photo.caption ?? lightboxAlbum.title,
            description: photo.caption ?? undefined,
          }))}
        />
      )}
    </>
  );
}
