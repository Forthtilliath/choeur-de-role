import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateHelpers';
import { ExternalEvent } from '../types';

export function EventRow({
  event,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  event: ExternalEvent;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const sortedDates = [...event.external_event_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const firstDate = sortedDates[0];

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background">
      <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30">
            🎭
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {firstDate && (
            <p className="text-xs text-foreground/50">📅 {formatDate(firstDate.date)}</p>
          )}
          {sortedDates.length > 1 && (
            <p className="text-xs text-foreground/30">
              +{sortedDates.length - 1} date{sortedDates.length > 2 ? 's' : ''}
            </p>
          )}
          {event.location && (
            <p className="text-xs text-foreground/40 truncate">📍 {event.location}</p>
          )}
        </div>
      </div>

      <span
        className={`text-xs px-2 py-1 rounded-full shrink-0 ${event.published ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground/40'}`}
      >
        {event.published ? 'Publié' : 'Brouillon'}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Modifier
        </Button>
        <Button size="sm" variant="ghost" onClick={onTogglePublish}>
          {event.published ? 'Dépublier' : 'Publier'}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
