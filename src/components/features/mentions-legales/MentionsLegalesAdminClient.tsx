'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { saveLegalData } from './clientQueries';
import { LegalData, LEGAL_FIELDS } from './types';
import { CenterMapPicker } from './CenterMapPicker';

export function MentionsLegalesAdminClient({ initialData }: { initialData: LegalData }) {
  const [data, setData] = useState<LegalData>(initialData);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const ok = await saveLegalData(data);
    if (ok) {
      setSuccess(true);
      toast.success('Informations mises à jour');
      setTimeout(() => setSuccess(false), 3000);
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {LEGAL_FIELDS.map((section) =>
        section.section === 'Carte des choristes' ? (
          <div
            key={section.section}
            className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background"
          >
            <h2 className="text-sm font-medium text-foreground">{section.section}</h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Nom du lieu de répétition</label>
              <input
                type="text"
                value={data['center_label'] ?? ''}
                onChange={(e) => handleChange('center_label', e.target.value)}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Position sur la carte</label>
              <CenterMapPicker
                lat={data['center_lat'] ?? ''}
                lng={data['center_lng'] ?? ''}
                label={data['center_label'] ?? ''}
                onChange={(lat, lng) =>
                  setData((prev) => ({ ...prev, center_lat: lat, center_lng: lng }))
                }
              />
            </div>
          </div>
        ) : (
          <div
            key={section.section}
            className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background"
          >
            <h2 className="text-sm font-medium text-foreground">{section.section}</h2>
            {section.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-xs text-foreground/50">{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={data[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                />
              </div>
            ))}
          </div>
        ),
      )}

      {success && (
        <p className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 text-center">
          ✓ Informations mises à jour
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} loading={saving}>
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
