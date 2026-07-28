import { Tables } from '@/types/database';

export type MemberProfile = Tables<'members'> & {
  voice_parts: { name: string } | null;
};

export type Coords = { lat: number; lng: number };

export type BirthdayVisibility = 'none' | 'date_only' | 'date_and_age';
