import { Tables } from '@/types/database';

export type CalendarEvent = Tables<'calendar_events'> & {
  event_types: Pick<Tables<'event_types'>, 'label' | 'color' | 'is_special'>;
  photo_url?: string | null;
};
export type EventType = Tables<'event_types'>;

// Évènement virtuel — pas stocké en DB
export type BirthdayEvent = {
  id: string; // `birthday-{memberId}`
  memberId: string;
  firstName: string;
  lastName: string;
  day: number;
  month: number; // 0-indexed
  age: number | null; // null si date_only
};

export type BirthdayMember = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  visibility_birthday: string;
  photo_url?: string | null;
};
