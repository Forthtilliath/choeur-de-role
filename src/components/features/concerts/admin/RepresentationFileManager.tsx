'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase.client';
import { uploadRepresentationFile, deleteRepresentationFile } from '../clientQueries';

type RepFile = { id: string; label: string; file_url: string };

export function RepresentationFileManager({ performanceId }: { performanceId: string }) {
  const [files, setFiles] = useState<RepFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const confirm = useConfirm();

  useEffect(() => {
    createClient()
      .from('representation_files')
      .select('id, label, file_url')
      .eq('performance_id', performanceId)
      .order('order_index')
      .then(({ data }) => {
        setFiles(data ?? []);
        setLoading(false);
      });
  }, [performanceId]);

  async function handleUpload() {
    if (!file || !label.trim()) return;
    setUploading(true);
    const result = await uploadRepresentationFile({ performanceId, file, label: label.trim() });
    if (result) {
      setFiles((prev) => [...prev, result]);
      setLabel('');
      setFile(null);
      toast.success('Fichier ajouté');
    } else {
      toast.error("Erreur lors de l'ajout");
    }
    setUploading(false);
  }

  async function handleDelete(id: string, fileName: string) {
    if (!await confirm({ message: `Supprimer "${fileName}" ?`, danger: true })) return;
    const ok = await deleteRepresentationFile(id);
    if (ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('Fichier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Documents partagés{' '}
        <span className="text-foreground/40 font-normal">(paroles globales, programme…)</span>
      </label>

      {loading ? (
        <p className="text-xs text-foreground/40">Chargement...</p>
      ) : (
        <>
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <span className="text-sm flex-1 min-w-0 truncate text-foreground">{f.label}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id, f.label)}
                    className="text-foreground/40 hover:text-red-500 transition-colors shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 p-3 rounded-lg border border-dashed border-border">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nom du fichier (ex: Paroles Fête de la musique 2026)"
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full"
            />
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer min-w-0">
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all bg-background">
                  <span>📎</span>
                  <span className="truncate">{file ? file.name : 'Choisir un fichier...'}</span>
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={uploading || !file || !label.trim()}
                loading={uploading}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
