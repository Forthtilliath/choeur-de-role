import { BirthdayMember, CalendarEvent, EventType } from './types';

export function buildBirthdayEvents(
  members: BirthdayMember[],
  year: number,
  birthdayType: Pick<EventType, 'id' | 'label' | 'color' | 'is_special'>,
  showAge = false,
): CalendarEvent[] {
  return members
    .filter((m) => m.birthday)
    .map((m) => {
      const bday = new Date(m.birthday!);
      const age =
        showAge || m.visibility_birthday === 'date_and_age' ? year - bday.getFullYear() : null;

      const date = new Date(year, bday.getMonth(), bday.getDate(), 0, 0);

      const title =
        age !== null
          ? `🎂 ${m.first_name} ${m.last_name} (${age} ans)`
          : `🎂 ${m.first_name} ${m.last_name}`;

      return {
        id: `birthday-${m.id}-${year}`,
        title,
        event_type_id: birthdayType.id,
        starts_at: date.toISOString(),
        ends_at: date.toISOString(),
        location: null,
        description: null,
        created_at: null,
        series_id: null,
        photo_url: m.photo_url ?? null,
        event_types: {
          label: birthdayType.label,
          color: birthdayType.color,
          is_special: birthdayType.is_special,
        },
      };
    });
}
