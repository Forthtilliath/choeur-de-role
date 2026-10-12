import { z } from 'zod';

// Validation des fiches envoyées par l'import CSV de comptes (route admin bulk-import-members)

// Champ facultatif : chaîne vide (CSV) → null
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

const optionalUuid = z
  .union([z.uuid(), z.literal('')])
  .nullish()
  .transform((value) => value || null);

// Un import crée un compte et envoie un e-mail par ligne : borné pour rester dans les délais
// d'une requête et éviter qu'un fichier erroné crée des centaines de comptes
export const MAX_IMPORT_ROWS = 200;

export const importRowSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().pipe(z.email().max(254)),
  voice_part_id: optionalUuid,
  season_ids: z.array(z.uuid()).max(20).default([]),
  phone: optionalText(30),
  address: optionalText(200),
  zip_code: optionalText(10),
  city: optionalText(100),
  birthday: z
    .union([z.iso.date(), z.literal('')])
    .nullish()
    .transform((value) => value || null),
});

export const bulkImportSchema = z.object({
  rows: z.array(z.unknown()).min(1).max(MAX_IMPORT_ROWS),
  send_emails: z.boolean(),
});
