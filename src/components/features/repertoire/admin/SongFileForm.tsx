'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { updateSongFile, uploadSongFile } from '../clientQueries';
import { FileType, SongFile, VoicePart } from '../types';

export function SongFileForm({
  songId,
  file,
  voiceParts,
  onCloseAction,
  onSaveAction,
}: {
  songId: string;
  file: SongFile | null;
  voiceParts: VoicePart[];
  onCloseAction: () => void;
  onSaveAction: (file: SongFile) => void;
}) {
  const [type, setType] = useState<FileType>((file?.type as FileType) ?? 'audio');
  const [label, setLabel] = useState(file?.label ?? '');
  const [selectedVoiceParts, setSelectedVoiceParts] = useState<string[]>(
    file?.song_file_voice_part.map((p) => p.voice_part_id) ?? [],
  );
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function handleTypeChange(t: FileType) {
    setType(t);
    if (t === 'score') setSelectedVoiceParts([]);
  }

  function toggleVoicePart(id: string) {
    setSelectedVoiceParts((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      if (file) {
        const saved = await updateSongFile(
          file.id,
          songId,
          { type, label: label || null, file_url: file.file_url },
          selectedVoiceParts,
          newFile,
        );
        if (saved) {
          onSaveAction(saved);
          toast.success('Fichier modifié');
        } else {
          toast.error('Erreur lors de la modification');
        }
      } else {
        if (!newFile) return;
        const saved = await uploadSongFile({
          songId,
          file: newFile,
          type,
          label,
          voicePartIds: selectedVoiceParts,
        });
        onSaveAction(saved);
        toast.success('Fichier ajouté');
      }
    } catch {
      toast.error("Erreur lors de l'upload du fichier");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-background-secondary">
      <h3 className="text-sm font-medium mb-4 text-foreground">
        {file ? 'Modifier le fichier' : 'Ajouter un fichier'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type — ordre identique aux filtres : Audio / Paroles / Partitions */}
        <div className="flex gap-2">
          {(['audio', 'lyrics', 'score'] as FileType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2 rounded-lg text-sm border transition-all ${type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
            >
              {t === 'audio' ? '🎵 Audio' : t === 'lyrics' ? '📝 Paroles' : '📄 Partition'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Label <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder={
              type === 'audio'
                ? 'Version Camille'
                : type === 'score'
                  ? 'Partition complète'
                  : 'Paroles v2'
            }
          />
        </div>

        {/* Fichier — avant les pupitres */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Fichier{' '}
            {file && (
              <span className="text-foreground/40 font-normal">
                (laisser vide pour garder l&apos;actuel)
              </span>
            )}
          </label>
          <label className="cursor-pointer">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
                newFile
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-foreground/40 hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <Upload className="w-5 h-5 shrink-0" />
              <span className="text-sm truncate">
                {newFile ? newFile.name : 'Choisir un fichier…'}
              </span>
            </div>
            <input
              type="file"
              required={!file}
              accept={type === 'audio' ? 'audio/*' : '.pdf,.doc,.docx,image/*'}
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        {/* Pupitres — masqué pour les partitions (toujours tutti) */}
        {type !== 'score' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Pupitres <span className="text-foreground/40 font-normal">(vide = tous)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {voiceParts.map((vp) => (
                <button
                  key={vp.id}
                  type="button"
                  onClick={() => toggleVoicePart(vp.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedVoiceParts.includes(vp.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
                >
                  {vp.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || (!file && !newFile)} loading={saving}>
            {saving ? 'Sauvegarde...' : file ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
