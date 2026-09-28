import NextImage from 'next/image';

import { UpcomingBadge } from '@/components/ui/UpcomingBadge';

type Props = {
  src: string | null;
  alt: string;
  /** Glyphe affiché quand il n'y a pas d'affiche */
  fallback: string;
  upcoming?: boolean;
};

// Affiche des pages détail : posée légèrement de biais sur la table, liseré doré
export function PosterFrame({ src, alt, fallback, upcoming = false }: Props) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-background-secondary bg-board w-full aspect-poster ring-1 ring-secondary/50 shadow-xl md:-rotate-1 transition-transform duration-500 hover:rotate-0">
      {src ? (
        <NextImage
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl">{fallback}</span>
        </div>
      )}
      {upcoming && <UpcomingBadge className="absolute top-3 right-3" />}
    </div>
  );
}
