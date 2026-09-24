'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

import { uploadPartnerLogo, upsertPartner } from './clientQueries';
import type { Partner } from './types';

export function PartnerForm({
  partner,
  onClose,
  onSave,
  onDirtyChange,
}: {
  partner: Partner | null;
  onClose: () => void;
  onSave: (partner: Partner) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [name, setName] = useState(partner?.name ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(partner?.website_url ?? '');
  const [isCurrent, setIsCurrent] = useState(!partner?.size?.startsWith('past'));
  const [isLarge, setIsLarge] = useState(partner?.size?.endsWith('large') ?? true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(partner?.logo_url ?? '');
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const initialRef = useRef({
    name: partner?.name ?? '',
    websiteUrl: partner?.website_url ?? '',
    isCurrent: !partner?.size?.startsWith('past'),
    isLarge: partner?.size?.endsWith('large') ?? true,
  });

  useEffect(() => {
    if (!formRef.current) return;
    const top = formRef.current.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const dirty =
      name !== initialRef.current.name ||
      websiteUrl !== initialRef.current.websiteUrl ||
      isCurrent !== initialRef.current.isCurrent ||
      isLarge !== initialRef.current.isLarge ||
      logoFile !== null;
    onDirtyChange(dirty);
  }, [name, websiteUrl, isCurrent, isLarge, logoFile, onDirtyChange]);

  function getSize(): Partner['size'] {
    if (isCurrent && isLarge) return 'current_large';
    if (isCurrent && !isLarge) return 'current_square';
    if (!isCurrent && isLarge) return 'past_large';
    return 'past_square';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let logo_url = partner?.logo_url ?? '';
    if (logoFile) {
      const url = await uploadPartnerLogo(logoFile);
      if (url) logo_url = url;
      else toast.error("Erreur lors de l'upload du logo");
    }

    const saved = await upsertPartner(
      { name, website_url: websiteUrl || null, size: getSize(), logo_url },
      partner?.id,
    );
    if (saved) {
      onSave(saved);
      toast.success(partner ? 'Sponsor modifié' : 'Sponsor ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div
      ref={formRef}
      className="border border-border rounded-2xl p-6 mb-8 bg-background-secondary"
    >
      <h2 className="text-lg font-medium mb-6 text-foreground">
        {partner ? 'Modifier le sponsor' : 'Ajouter un sponsor'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="partner-name" className="text-sm font-medium text-foreground">
            Nom
          </label>
          <input
            id="partner-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="partner-website" className="text-sm font-medium text-foreground">
            Site web (optionnel)
          </label>
          <input
            id="partner-website"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="partner-logo" className="text-sm font-medium text-foreground">
            Logo
          </label>
          <input
            id="partner-logo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            className="text-sm text-foreground/70"
          />
          {logoPreview && (
            <div className="relative w-full h-60 border border-border rounded-lg bg-white overflow-hidden">
              <Image
                src={logoPreview}
                alt="Preview"
                fill
                className="object-contain p-2"
                sizes="100vw"
              />
            </div>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Statut</legend>
          <div className="flex gap-3">
            {[
              { value: true, label: 'En cours' },
              { value: false, label: 'Passé' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setIsCurrent(opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-all ${isCurrent === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Format d&apos;affichage</legend>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsLarge(true)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${isLarge ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <div
                className={`w-full h-12 rounded-lg ${isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
              />
              <span
                className={`text-xs font-medium ${isLarge ? 'text-primary' : 'text-foreground/50'}`}
              >
                Large
              </span>
              <span className="text-xs text-foreground/40">
                {isCurrent ? 'Pleine largeur' : '2 par ligne'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsLarge(false)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${!isLarge ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <div className="flex gap-2">
                <div
                  className={`w-10 h-10 rounded-lg ${!isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
                />
                <div
                  className={`w-10 h-10 rounded-lg ${!isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
                />
              </div>
              <span
                className={`text-xs font-medium ${!isLarge ? 'text-primary' : 'text-foreground/50'}`}
              >
                Carré
              </span>
              <span className="text-xs text-foreground/40">{isCurrent ? 2 : 3} par ligne</span>
            </button>
          </div>
        </fieldset>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : partner ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
