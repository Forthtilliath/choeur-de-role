import { Tables } from '@/types/database';

export type MemberLink = Tables<'member_links'>;
export type Visibility = 'member' | 'ca' | 'admin';

export const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'member', label: 'Tous les choristes', description: 'Visible par tous les membres' },
  { value: 'ca', label: 'CA et admins', description: "Réservé au conseil d'administration" },
  { value: 'admin', label: 'Admins uniquement', description: 'Réservé aux administrateurs' },
];

export const VISIBILITY_BADGE: Record<Visibility, string> = {
  member: 'bg-foreground/10 text-foreground/50',
  ca: 'bg-blue-100 text-blue-600',
  admin: 'bg-red-100 text-red-600',
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  member: 'Tous',
  ca: 'CA',
  admin: 'Admin',
};
