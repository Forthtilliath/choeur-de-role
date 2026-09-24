import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { formatEventDateRange } from '@/utils/dateHelpers';

import { LocationMap } from './LocationMap';
import type { CalendarEvent } from './types';

type Props = {
  event: CalendarEvent;
  isBirthday: boolean;
  onCloseAction: () => void;
};

export function EventReadOnlyView({ event, isBirthday, onCloseAction }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{event.title}</p>
          {!isBirthday && <p className="text-xs text-foreground/50">{event.event_types.label}</p>}
          <p className="text-xs text-foreground/60">
            {formatEventDateRange(event.starts_at, event.ends_at)}
          </p>
        </div>
        {isBirthday && event.photo_url && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-border">
            <Image
              src={event.photo_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
      </div>
      {event.location && <LocationMap location={event.location} />}
      {event.description && (
        <p className="text-sm text-foreground/70 mt-2 whitespace-pre-line">{event.description}</p>
      )}
      <Button
        onClick={onCloseAction}
        variant="ghost"
        className="mt-4 text-sm text-foreground/50 hover:text-foreground"
      >
        Fermer
      </Button>
    </div>
  );
}
