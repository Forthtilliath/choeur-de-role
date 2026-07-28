'use client';

import { useState, useEffect, useRef } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { openSignedUrl } from '@/lib/downloadFile';
import { deleteSongFile } from '../clientQueries';
import { buildFileLabel } from '../helpers';
import { formatDateShort } from '@/utils/dateHelpers';
import { FileType, Song, SongFile, VoicePart } from '../types';
import { SongFileForm } from './SongFileForm';

const TYPE_ORDER: FileType[] = ['audio', 'lyrics', 'score'];
const typeIcon = (type: string) => (type === 'audio' ? '🎵' : type === 'score' ? '📄' : '📝');
const typeLabel = (type: string) =>
  type === 'audio' ? 'Audio' : type === 'score' ? 'Partition' : 'Paroles';

export function FileManager({
  song,
  voiceParts,
  activeFileType,
  onUpdateFilesAction,
  triggerAddFile,
  onAddFileTriggeredAction,
}: {
  song: Song;
  voiceParts: VoicePart[];
  activeFileType: FileType | null;
  onUpdateFilesAction: (files: SongFile[]) => void;
  triggerAddFile?: boolean;
  onAddFileTriggeredAction?: () => void;
}) {
  const [files, setFiles] = useState<SongFile[]>(song.song_files);
  const [showFileForm, setShowFileForm] = useState(false);
  const [editingFile, setEditingFile] = useState<SongFile | null>(null);
  const [loadingFile, setLoading] = useState(false);
  const [prevTrigger, setPrevTrigger] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();
  const formOpen = showFileForm || !!editingFile;

  // Dériver l'ouverture du form depuis la prop au render (pas dans un effect)
  if (triggerAddFile && !prevTrigger) {
    setPrevTrigger(true);
    setShowFileForm(true);
    setEditingFile(null);
  } else if (!triggerAddFile && prevTrigger) {
    setPrevTrigger(false);
  }

  useEffect(() => {
    if (triggerAddFile) onAddFileTriggeredAction?.();
  }, [triggerAddFile, onAddFileTriggeredAction]);

  useEffect(() => {
    if (!formOpen) return;
    if (window.innerWidth >= 1024) {
      const card = formRef.current?.closest('[data-song-card]');
      if (card) {
        const header = document.querySelector('header');
        const offset = (header?.offsetHeight ?? 80) + 45;
        const top = card.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [formOpen]);

  function getFileVoicePartOrder(file: SongFile): number {
    if (file.song_file_voice_part.length === 0) return -1;
    const orders = file.song_file_voice_part.map(
      (svp) => voiceParts.find((vp) => vp.id === svp.voice_part_id)?.order_index ?? 999,
    );
    return Math.min(...orders);
  }

  const sortedFiles = [...files].sort((a, b) => {
    const typeA = TYPE_ORDER.indexOf((a.type as FileType) ?? 'audio');
    const typeB = TYPE_ORDER.indexOf((b.type as FileType) ?? 'audio');
    if (typeA !== typeB) return typeA - typeB;
    return getFileVoicePartOrder(a) - getFileVoicePartOrder(b);
  });

  const filteredFiles = activeFileType
    ? sortedFiles.filter((f) => f.type === activeFileType)
    : sortedFiles;

  function closeForm() {
    setShowFileForm(false);
    setEditingFile(null);
  }

  async function handleDeleteFile(id: string) {
    if (!await confirm({ message: 'Supprimer ce fichier ?', danger: true })) return;
    const ok = await deleteSongFile(id);
    if (ok) {
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      onUpdateFilesAction(updated);
      toast.success('Fichier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSaveFile(file: SongFile) {
    const exists = files.find((f) => f.id === file.id);
    const updated = exists ? files.map((f) => (f.id === file.id ? file : f)) : [...files, file];
    setFiles(updated);
    onUpdateFilesAction(updated);
    closeForm();
  }

  async function openFile(file: SongFile) {
    setLoading(true);
    try {
      await openSignedUrl(file.file_url);
    } finally {
      setLoading(false);
    }
  }

  const grouped = new Map<FileType, SongFile[]>();
  for (const type of TYPE_ORDER) {
    const group = filteredFiles.filter((f) => f.type === type);
    if (group.length > 0) grouped.set(type, group);
  }


  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
      {/* Liste des fichiers + bouton Ajouter */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {filteredFiles.length === 0 && !formOpen && (
          <p className="text-sm text-foreground/40 text-center py-4">
            Aucun fichier{activeFileType ? ` de type ${typeLabel(activeFileType)}` : ''}.
          </p>
        )}

        {Array.from(grouped.entries()).map(([type, groupFiles]) => (
          <div key={type} className="flex flex-col gap-2">
            {!activeFileType && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-foreground/50">
                  {typeIcon(type)} {typeLabel(type)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            {groupFiles.map((file) => {
              const date = file.created_at ? formatDateShort(file.created_at) : null;
              const isEditing = editingFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  data-testid="file-item"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-background transition-colors ${
                    isEditing ? 'border-primary' : 'border-border'
                  }`}
                >
                  <span className="text-lg shrink-0">{typeIcon(file.type ?? '')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{buildFileLabel(file, voiceParts)}</p>
                    {date && <span className="text-xs text-foreground/30">{date}</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingFile(file);
                        setShowFileForm(false);
                      }}
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openFile(file)}
                      disabled={loadingFile}
                      title="Voir"
                    >
                      <Eye className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Voir</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">✕</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      </div>

      {/* Backdrop */}
      {formOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeForm} />
      )}

      {/* Formulaire — bottom sheet */}
      {formOpen && (
        <div ref={formRef} className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl lg:static lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:px-0 lg:pb-0 lg:pt-0 lg:max-h-none lg:overflow-visible lg:bg-transparent lg:rounded-none lg:w-80 lg:shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 lg:hidden" />
          <SongFileForm
            key={editingFile?.id ?? 'new'}
            songId={song.id}
            file={editingFile}
            voiceParts={voiceParts}
            onCloseAction={closeForm}
            onSaveAction={handleSaveFile}
          />
        </div>
      )}
    </div>
  );
}
