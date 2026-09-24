import { formatPhone } from '@/utils/phoneHelpers';

import type { BirthdayVisibility, MemberProfile } from './types';

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  birthday: string;
  visibilityEmail: boolean;
  visibilityPhone: boolean;
  visibilityAddress: boolean;
  visibilityBirthday: BirthdayVisibility;
};

export const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  phone: 'Téléphone',
  address: 'Adresse',
  zip_code: 'Code postal',
  city: 'Ville',
  birthday: 'Date de naissance',
  visibility_email: 'Visibilité email',
  visibility_phone: 'Visibilité téléphone',
  visibility_address: 'Visibilité adresse',
  coordinates: 'Coordonnées géographiques',
};

export function initialProfileValues(member: MemberProfile): ProfileFormValues {
  return {
    firstName: member.first_name ?? '',
    lastName: member.last_name ?? '',
    phone: member.phone ? formatPhone(member.phone.replace(/\D/g, '')) : '',
    address: member.address ?? '',
    zipCode: member.zip_code ?? '',
    city: member.city ?? '',
    birthday: member.birthday ? member.birthday.slice(0, 10) : '',
    visibilityEmail: member.visibility_email ?? false,
    visibilityPhone: member.visibility_phone ?? false,
    visibilityAddress: member.visibility_address ?? false,
    visibilityBirthday: (member.visibility_birthday as BirthdayVisibility) ?? 'none',
  };
}

// Clés (colonnes DB) des champs modifiés par rapport au profil enregistré
export function detectProfileChanges(
  v: ProfileFormValues,
  member: MemberProfile,
  hasCoordChanges: boolean,
): string[] {
  const changes: string[] = [];
  if (v.firstName !== (member.first_name ?? '')) changes.push('first_name');
  if (v.lastName !== (member.last_name ?? '')) changes.push('last_name');
  if (v.phone.replace(/\s/g, '') !== (member.phone ?? '')) changes.push('phone');
  if (v.address !== (member.address ?? '')) changes.push('address');
  if (v.zipCode !== (member.zip_code ?? '')) changes.push('zip_code');
  if (v.city !== (member.city ?? '')) changes.push('city');
  if (v.birthday !== (member.birthday?.slice(0, 10) ?? '')) changes.push('birthday');
  if (v.visibilityEmail !== (member.visibility_email ?? false)) changes.push('visibility_email');
  if (v.visibilityPhone !== (member.visibility_phone ?? false)) changes.push('visibility_phone');
  if (v.visibilityAddress !== (member.visibility_address ?? false))
    changes.push('visibility_address');
  if (v.visibilityBirthday !== (member.visibility_birthday ?? 'none'))
    changes.push('visibility_birthday');
  if (hasCoordChanges) changes.push('coordinates');
  return changes;
}
