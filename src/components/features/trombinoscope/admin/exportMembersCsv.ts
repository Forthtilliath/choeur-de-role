import { downloadCsv, toCsv } from '@/utils/csv';

import type { Season } from '../../concerts';
import type { AdminMemberWithSeasons } from '../types';

const HEADERS = [
  'prénom',
  'nom',
  'email',
  'téléphone',
  'adresse',
  'code_postal',
  'ville',
  'date_de_naissance',
  'pupitre',
  'rôle',
  'rôle_bureau',
  'saisons',
];

export function exportMembersCsv(members: AdminMemberWithSeasons[], seasons: Season[]) {
  const seasonMap = new Map(seasons.map((s) => [s.id, s.label ?? '']));
  const rows = members.map((m) => [
    m.first_name ?? '',
    m.last_name ?? '',
    m.email ?? '',
    m.phone ?? '',
    m.address ?? '',
    m.zip_code ?? '',
    m.city ?? '',
    m.birthday ?? '',
    m.voice_parts?.name ?? '',
    m.role ?? '',
    m.bureau_role ?? '',
    m.member_season
      .map((ms) => seasonMap.get(ms.season_id ?? '') ?? '')
      .filter(Boolean)
      .join(' | '),
  ]);
  downloadCsv(
    toCsv([HEADERS, ...rows]),
    `membres-cda-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}
