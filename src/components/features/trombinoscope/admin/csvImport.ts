import { downloadCsv, parseCsvLine } from '@/utils/csv';

import type { Season } from '../../concerts';
import type { VoicePart } from '../types';

export type ParsedRow = {
  lineNumber: number; // ligne dans le fichier CSV (1 = en-tête)
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  city: string;
  birthday: string;
  voice_part_name: string;
  season_label: string;
  voice_part_id: string | null;
  season_ids: string[];
  errors: string[];
  warnings: string[];
};

const COLUMN_MAP: Record<string, string> = {
  prénom: 'first_name',
  prenom: 'first_name',
  first_name: 'first_name',
  firstname: 'first_name',
  nom: 'last_name',
  last_name: 'last_name',
  lastname: 'last_name',
  email: 'email',
  courriel: 'email',
  pupitre: 'voice_part',
  voice_part: 'voice_part',
  voicepart: 'voice_part',
  saison: 'season',
  season: 'season',
  téléphone: 'phone',
  telephone: 'phone',
  phone: 'phone',
  tel: 'phone',
  mobile: 'phone',
  portable: 'phone',
  rue: 'address',
  adresse: 'address',
  address: 'address',
  street: 'address',
  code_postal: 'zip_code',
  codepostal: 'zip_code',
  zip_code: 'zip_code',
  zipcode: 'zip_code',
  cp: 'zip_code',
  ville: 'city',
  city: 'city',
  date_de_naissance: 'birthday',
  date_naissance: 'birthday',
  naissance: 'birthday',
  birthday: 'birthday',
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function downloadImportTemplate() {
  downloadCsv(
    'prénom,nom,email,pupitre,saison,téléphone,adresse,code_postal,ville,date_de_naissance\nJean,Dupont,jean.dupont@example.com,Ténors,2025-2026,0612345678,12 rue de la Paix,75001,Paris,1985-03-15\n',
    'modele-import-membres.csv',
  );
}

function parseRow(
  raw: Record<string, string>,
  lineNumber: number,
  voiceParts: VoicePart[],
  seasons: Season[],
  defaultSeasonIds: string[],
): ParsedRow {
  const first_name = raw.first_name ?? '';
  const last_name = raw.last_name ?? '';
  const email = raw.email ?? '';
  const voice_part_name = raw.voice_part ?? '';
  const season_label = raw.season ?? '';
  let birthday = raw.birthday ?? '';

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!first_name) errors.push('Prénom manquant');
  if (!last_name) errors.push('Nom manquant');
  if (!email) errors.push('Email manquant');
  else if (!isValidEmail(email)) errors.push('Email invalide');

  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    warnings.push('Date de naissance ignorée (format attendu : AAAA-MM-JJ)');
    birthday = '';
  }

  let voice_part_id: string | null = null;
  if (voice_part_name) {
    const vp = voiceParts.find((v) => v.name.toLowerCase() === voice_part_name.toLowerCase());
    if (vp) voice_part_id = vp.id;
    else warnings.push(`Pupitre inconnu : "${voice_part_name}"`);
  }

  let season_ids: string[] = defaultSeasonIds;
  if (season_label) {
    const season = seasons.find((s) => s.label?.toLowerCase() === season_label.toLowerCase());
    if (season) season_ids = [season.id];
    else warnings.push(`Saison inconnue : "${season_label}" — saison active par défaut`);
  }

  return {
    lineNumber,
    first_name,
    last_name,
    email,
    phone: raw.phone ?? '',
    address: raw.address ?? '',
    zip_code: raw.zip_code ?? '',
    city: raw.city ?? '',
    birthday,
    voice_part_name,
    season_label,
    voice_part_id,
    season_ids,
    errors,
    warnings,
  };
}

// Analyse le contenu d'un CSV de membres ; renvoie les lignes validées ou un message d'erreur
export function parseMembersCsv(
  text: string,
  voiceParts: VoicePart[],
  seasons: Season[],
): { rows: ParsedRow[] } | { error: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { error: 'Le fichier est vide ou ne contient pas de données' };

  const [headerLine = '', ...dataLines] = lines;
  const rawHeaders = parseCsvLine(headerLine).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const headers = rawHeaders.map((h) => COLUMN_MAP[h] ?? h);

  if (
    !headers.includes('first_name') ||
    !headers.includes('last_name') ||
    !headers.includes('email')
  ) {
    return { error: 'Colonnes requises manquantes : prénom, nom, email' };
  }

  const activeSeason = seasons.find((s) => s.active);
  const defaultSeasonIds = activeSeason ? [activeSeason.id] : [];

  const rows = dataLines.map((line, index) => {
    const values = parseCsvLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => {
      raw[h] = values[i] ?? '';
    });
    return parseRow(raw, index + 2, voiceParts, seasons, defaultSeasonIds);
  });
  return { rows };
}
