import { describe, expect, it } from 'vitest';

import { bulkImportSchema, importRowSchema, MAX_IMPORT_ROWS } from '../memberSchemas';

const IDENTITY = { first_name: ' Marie ', last_name: 'Dupont', email: 'marie@test.invalid' };
const UUID = '0f8fad5b-d9cb-469f-a165-70867728950e';

describe('importRowSchema', () => {
  it('nettoie les champs et convertit les champs vides du CSV en null', () => {
    const row = importRowSchema.parse({
      ...IDENTITY,
      voice_part_id: UUID,
      season_ids: [UUID],
      phone: '',
      address: '',
      zip_code: '',
      city: 'Angers',
      birthday: '',
    });
    expect(row).toMatchObject({
      first_name: 'Marie',
      phone: null,
      address: null,
      city: 'Angers',
      birthday: null,
    });
  });

  it('ignore les champs inconnus', () => {
    expect(importRowSchema.parse({ ...IDENTITY, role: 'super_admin' })).not.toHaveProperty('role');
  });

  it.each([
    ['un e-mail invalide', { ...IDENTITY, email: 'pas-un-email' }],
    ['un prénom vide', { ...IDENTITY, first_name: '  ' }],
    ['un pupitre qui n’est pas un identifiant', { ...IDENTITY, voice_part_id: 'Ténors' }],
    ['une date de naissance mal formée', { ...IDENTITY, birthday: '15/03/1985' }],
    ['une adresse démesurée', { ...IDENTITY, address: 'x'.repeat(5000) }],
  ])('refuse %s', (_, input) => {
    expect(importRowSchema.safeParse(input).success).toBe(false);
  });
});

describe('bulkImportSchema', () => {
  it(`refuse plus de ${MAX_IMPORT_ROWS} lignes`, () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => IDENTITY);
    expect(bulkImportSchema.safeParse({ rows, send_emails: true }).success).toBe(false);
  });

  it('refuse un import vide ou sans choix d’envoi des e-mails', () => {
    expect(bulkImportSchema.safeParse({ rows: [], send_emails: true }).success).toBe(false);
    expect(bulkImportSchema.safeParse({ rows: [IDENTITY] }).success).toBe(false);
  });
});
