'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GalleryVideo } from './types';

export function VideoCard({ video }: { video: GalleryVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black group">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
            title={video.title ?? ''}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="w-full h-full relative block group">
            {video.thumbnail_url ? (
              <Image
                src={video.thumbnail_url}
                alt={video.title ?? ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-background-secondary" />
            )}
            {/* Overlay play */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl ml-1">▶</span>
              </div>
            </div>
          </button>
        )}
      </div>
      {video.title && <p className="text-xs text-foreground/60 truncate px-0.5">{video.title}</p>}
    </div>
  );
}
