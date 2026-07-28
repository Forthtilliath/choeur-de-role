import { Tables } from '@/types/database';

export type ExternalEventDate = Tables<'external_event_dates'>;
export type ExternalEventFile = Tables<'external_event_files'>;
export type ExternalEvent = Tables<'external_events'> & {
  external_event_dates: ExternalEventDate[];
  external_event_files: ExternalEventFile[];
};
