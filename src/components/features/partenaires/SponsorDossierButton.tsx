'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadSponsorDossier } from './clientQueries';

export function SponsorDossierButton({ currentUrl }: { currentUrl: string }) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const newUrl = await uploadSponsorDossier(file);
    if (newUrl) {
      setUrl(newUrl);
      toast.success('Dossier de sponsoring mis à jour');
    } else {
      toast.error("Erreur lors de l'upload du dossier");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <label className="cursor-pointer">
      <span
        className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-80 px-4 py-2.5 border border-border text-foreground/60 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {uploading ? 'Upload...' : url ? '📄 Changer le dossier' : '📄 Ajouter un dossier'}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        className="hidden"
      />
    </label>
  );
}
