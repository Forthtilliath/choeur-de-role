import { Tables, TablesInsert } from '@/types/database';
import { Merge } from '@/types/utils';

export type VoicePart = Tables<'voice_parts'>;

export type TrombiMember = Merge<
  Tables<'members'> & {
    voice_parts: Pick<VoicePart, 'id' | 'name' | 'group_name' | 'order_index'> | null;
  }
>;

export type AdminMember = Merge<
  Tables<'members'> & {
    voice_parts: Pick<VoicePart, 'id' | 'name'> | null;
  }
>;

export type AdminMemberWithSeasons = Merge<
  AdminMember & {
    member_season: Pick<Tables<'member_season'>, 'season_id'>[];
  }
>;

export type AuthInfo = {
  emailConfirmedAt: string | undefined;
  lastSignInAt: string | undefined;
  isLocked: boolean;
};

export type ColumnKey =
  | 'ca'
  | 'voice_part'
  | 'photo'
  | 'first_name'
  | 'last_name'
  | 'address'
  | 'email'
  | 'phone';

export type Column = {
  key: ColumnKey;
  label: string;
  visible: boolean;
};

export const DEFAULT_COLUMNS: Column[] = [
  { key: 'ca', label: 'CA', visible: true },
  { key: 'voice_part', label: 'Pupitre', visible: true },
  { key: 'photo', label: 'Photo', visible: true },
  { key: 'first_name', label: 'Prénom', visible: true },
  { key: 'last_name', label: 'Nom', visible: true },
  { key: 'address', label: 'Adresse', visible: true },
  { key: 'email', label: 'Courriel', visible: true },
  { key: 'phone', label: 'Téléphone', visible: true },
];

export const ROLE_LABELS: Record<string, string> = {
  member: 'Membre',
  ca: 'CA',
  admin: 'Admin',
  super_admin: 'Super Admin',
};


export type MemberInsert = TablesInsert<'members'>