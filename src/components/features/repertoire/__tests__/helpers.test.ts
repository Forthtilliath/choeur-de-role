import { describe, it, expect } from 'vitest';
import { buildFileLabel, getVoicePartDisplay } from '../helpers';
import type { SongFile, VoicePart } from '../types';

// Fixtures minimaux (les champs DB non utilisés sont ignorés avec cast)
const vp = (id: string, name: string, group_name: string | null) =>
  ({ id, name, group_name }) as unknown as VoicePart;

const sopranos = [vp('sp1', 'Soprano 1', 'Soprano'), vp('sp2', 'Soprano 2', 'Soprano')];
const basse = vp('ba', 'Basse', null);
const tenor = vp('te', 'Ténor', null);
const allParts = [...sopranos, basse, tenor];

const file = (type: string, label: string | null, voicePartIds: string[] = []) =>
  ({
    type,
    label,
    song_file_voice_part: voicePartIds.map((id) => ({ voice_part_id: id })),
  }) as unknown as SongFile;

// ── getVoicePartDisplay ──────────────────────────────────────────

describe('getVoicePartDisplay', () => {
  it('returns empty string when no voice parts selected', () => {
    expect(getVoicePartDisplay([], allParts)).toBe('');
  });

  it('shows group name when ALL parts in a group are present', () => {
    expect(getVoicePartDisplay(['sp1', 'sp2'], allParts)).toBe('Soprano');
  });

  it('shows individual name when only SOME parts in group are present', () => {
    expect(getVoicePartDisplay(['sp1'], allParts)).toBe('Soprano 1');
  });

  it('shows individual name for a part without a group', () => {
    expect(getVoicePartDisplay(['ba'], allParts)).toBe('Basse');
  });

  it('combines multiple selections', () => {
    const result = getVoicePartDisplay(['sp1', 'sp2', 'ba'], allParts);
    expect(result).toBe('Soprano, Basse');
  });
});

// ── buildFileLabel ───────────────────────────────────────────────

describe('buildFileLabel', () => {
  it('audio without voice part', () => {
    expect(buildFileLabel(file('audio', null), allParts)).toBe('Audio');
  });

  it('audio with a voice part', () => {
    expect(buildFileLabel(file('audio', null, ['ba']), allParts)).toBe('Audio Basse');
  });

  it('audio with group voice parts and label', () => {
    expect(buildFileLabel(file('audio', 'Version FDLM', ['sp1', 'sp2']), allParts)).toBe(
      'Audio Soprano — Version FDLM',
    );
  });

  it('score (partition) type', () => {
    expect(buildFileLabel(file('score', null), allParts)).toBe('Partition');
  });

  it('lyrics (paroles) type', () => {
    expect(buildFileLabel(file('lyrics', null), allParts)).toBe('Paroles');
  });

  it('includes optional label suffix', () => {
    expect(buildFileLabel(file('score', 'v2'), allParts)).toBe('Partition — v2');
  });
});
