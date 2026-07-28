import { SongFile, VoicePart } from './types';

export function getVoicePartDisplay(voicePartIds: string[], voiceParts: VoicePart[]): string {
  if (voicePartIds.length === 0) return '';

  const selectedParts = voicePartIds
    .map((id) => voiceParts.find((vp) => vp.id === id))
    .filter((vp): vp is VoicePart => Boolean(vp));

  const byGroup = new Map<string, VoicePart[]>();
  for (const vp of selectedParts) {
    const key = vp.group_name ?? vp.name;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push(vp);
  }

  const result: string[] = [];
  for (const [groupName, partsInFile] of byGroup.entries()) {
    const allPartsInGroup = voiceParts.filter((vp) => (vp.group_name ?? vp.name) === groupName);
    const allPresent = allPartsInGroup.every((vp) => voicePartIds.includes(vp.id));
    if (allPresent && allPartsInGroup.length > 1) {
      result.push(groupName);
    } else {
      for (const vp of partsInFile) result.push(vp.name);
    }
  }

  return [...new Set(result)].join(', ');
}

export function buildFileLabel(file: SongFile, voiceParts: VoicePart[]): string {
  const partIds = file.song_file_voice_part.map((p) => p.voice_part_id);
  const partsDisplay = getVoicePartDisplay(partIds, voiceParts);
  const typeLabel =
    file.type === 'audio' ? 'Audio' : file.type === 'score' ? 'Partition' : 'Paroles';
  const partsStr = partsDisplay ? ` ${partsDisplay}` : '';
  const labelStr = file.label ? ` — ${file.label}` : '';
  return `${typeLabel}${partsStr}${labelStr}`;
}
