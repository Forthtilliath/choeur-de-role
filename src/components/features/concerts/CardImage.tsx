import Image from 'next/image';
import { PerformanceDatesWithSeasons } from './types';

export function CardImage({
  performance,
  past,
  priority = false,
}: {
  performance: PerformanceDatesWithSeasons;
  past: boolean;
  priority?: boolean;
}) {
  return (
    <div className="relative bg-background-secondary aspect-poster group overflow-hidden">
      {performance.image_url ? (
        <Image
          src={performance.image_url}
          alt={performance.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
      )}
      {/* Saison uniquement sur les concerts passés */}
      {past && performance.seasons && (
        <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-background/90 text-foreground/70 backdrop-blur-sm">
          {performance.seasons.label}
        </span>
      )}
      {!past && (
        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-primary text-white">
          À venir
        </span>
      )}
    </div>
  );
}
