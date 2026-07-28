'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tables } from '@/types/database';
import { Season } from '../../concerts';
import { AdminMemberWithSeasons } from '../types';
import type { ImportRowResult } from '@/app/api/admin/bulk-import-members/route';

type VoicePart = Tables<'voice_parts'>;

type ParsedRow = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  city: string;
  birthday: string;
  voice_part_name: string;
  season_label: string;
  voice_part_id: string | null;
  season_ids: string[];
  errors: string[];
  warnings: string[];
};

type Props = {
  voiceParts: VoicePart[];
  seasons: Season[];
  onCloseAction: () => void;
  onSuccessAction: (members: AdminMemberWithSeasons[]) => void;
};

const COLUMN_MAP: Record<string, string> = {
  prénom: 'first_name', prenom: 'first_name', first_name: 'first_name', firstname: 'first_name',
  nom: 'last_name', last_name: 'last_name', lastname: 'last_name',
  email: 'email', courriel: 'email',
  pupitre: 'voice_part', voice_part: 'voice_part', voicepart: 'voice_part',
  saison: 'season', season: 'season',
  téléphone: 'phone', telephone: 'phone', phone: 'phone', tel: 'phone', mobile: 'phone', portable: 'phone',
  rue: 'address', adresse: 'address', address: 'address', street: 'address',
  code_postal: 'zip_code', codepostal: 'zip_code', zip_code: 'zip_code', zipcode: 'zip_code', cp: 'zip_code',
  ville: 'city', city: 'city',
  date_de_naissance: 'birthday', date_naissance: 'birthday', naissance: 'birthday', birthday: 'birthday',
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function downloadTemplate() {
  const content = 'prénom,nom,email,pupitre,saison,téléphone,adresse,code_postal,ville,date_de_naissance\nJean,Dupont,jean.dupont@example.com,Ténors,2025-2026,0612345678,12 rue de la Paix,75001,Paris,1985-03-15\n';
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modele-import-membres.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportPanel({ voiceParts, seasons, onCloseAction, onSuccessAction }: Props) {
  const [view, setView] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [sendEmails, setSendEmails] = useState(true);
  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeSeasons = seasons.filter((s) => s.active);
  const defaultSeasonIds = activeSeasons.length > 0 ? [activeSeasons[0].id] : [];

  function parseFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error('Le fichier est vide ou ne contient pas de données');
        return;
      }

      const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
      const headers = rawHeaders.map((h) => COLUMN_MAP[h] ?? h);

      if (!headers.includes('first_name') || !headers.includes('last_name') || !headers.includes('email')) {
        toast.error('Colonnes requises manquantes : prénom, nom, email');
        return;
      }

      const parsed: ParsedRow[] = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        const raw: Record<string, string> = {};
        headers.forEach((h, i) => { raw[h] = values[i] ?? ''; });

        const first_name = raw.first_name ?? '';
        const last_name = raw.last_name ?? '';
        const email = raw.email ?? '';
        const voice_part_name = raw.voice_part ?? '';
        const season_label = raw.season ?? '';
        const phone = raw.phone ?? '';
        const address = raw.address ?? '';
        const zip_code = raw.zip_code ?? '';
        const city = raw.city ?? '';
        let birthday = raw.birthday ?? '';

        const errors: string[] = [];
        const warnings: string[] = [];

        if (!first_name) errors.push('Prénom manquant');
        if (!last_name) errors.push('Nom manquant');
        if (!email) errors.push('Email manquant');
        else if (!isValidEmail(email)) errors.push('Email invalide');

        if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
          warnings.push('Date de naissance ignorée (format attendu : AAAA-MM-JJ)');
          birthday = '';
        }

        let voice_part_id: string | null = null;
        if (voice_part_name) {
          const vp = voiceParts.find(
            (v) => v.name.toLowerCase() === voice_part_name.toLowerCase(),
          );
          if (vp) voice_part_id = vp.id;
          else warnings.push(`Pupitre inconnu : "${voice_part_name}"`);
        }

        let season_ids: string[] = defaultSeasonIds;
        if (season_label) {
          const season = seasons.find(
            (s) => s.label?.toLowerCase() === season_label.toLowerCase(),
          );
          if (season) season_ids = [season.id];
          else warnings.push(`Saison inconnue : "${season_label}" — saison active par défaut`);
        }

        return { first_name, last_name, email, phone, address, zip_code, city, birthday, voice_part_name, season_label, voice_part_id, season_ids, errors, warnings };
      });

      setRows(parsed);
      setView('preview');
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.errors.length === 0);
    setView('importing');
    setProgress(0);

    const batchResults: ImportRowResult[] = [];
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const res = await fetch('/api/admin/bulk-import-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: [{
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            voice_part_id: row.voice_part_id,
            season_ids: row.season_ids,
            phone: row.phone || null,
            address: row.address || null,
            zip_code: row.zip_code || null,
            city: row.city || null,
            birthday: row.birthday || null,
          }],
          send_emails: sendEmails,
        }),
      });
      const data = await res.json();
      batchResults.push(...(data.results ?? []));
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResults(batchResults);
    setView('results');

    const successCount = batchResults.filter((r) => r.success).length;
    if (successCount > 0) {
      toast.success(`${successCount} membre${successCount > 1 ? 's' : ''} importé${successCount > 1 ? 's' : ''}`);
    }
  }

  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const validCount = rows.filter((r) => r.errors.length === 0).length;

  if (view === 'results') {
    const successRows = results.filter((r) => r.success);
    const failedRows = results.filter((r) => !r.success);
    const hasPassphrases = successRows.some((r) => r.passphrase);

    return (
      <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Résultats de l&apos;import</h2>
        </div>

        {successRows.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-foreground/60">
              ✅ {successRows.length} compte{successRows.length > 1 ? 's' : ''} créé{successRows.length > 1 ? 's' : ''}
              {!hasPassphrases && ' — emails d\'invitation envoyés'}
            </p>

            {hasPassphrases && (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Nom</th>
                      <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Email</th>
                      <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Passphrase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successRows.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-foreground">{r.first_name} {r.last_name}</td>
                        <td className="px-3 py-2 text-foreground/60 font-mono text-xs">{r.email}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                              {r.passphrase}
                            </code>
                            <button
                              onClick={() => { navigator.clipboard.writeText(r.passphrase ?? ''); toast.success('Copié'); }}
                              className="text-xs text-foreground/40 hover:text-foreground transition-colors"
                            >
                              Copier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {failedRows.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-600">❌ {failedRows.length} échec{failedRows.length > 1 ? 's' : ''}</p>
            <div className="flex flex-col gap-1">
              {failedRows.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 rounded-lg">
                  <span className="text-foreground font-medium">{r.first_name} {r.last_name}</span>
                  <span className="text-foreground/50">{r.email}</span>
                  <span className="text-red-600 dark:text-red-400 ml-auto">{r.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={() => onSuccessAction([])}>Fermer</Button>
        </div>
      </div>
    );
  }

  if (view === 'importing') {
    return (
      <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-4 items-center text-center">
        <p className="text-sm font-medium text-foreground">Import en cours…</p>
        <div className="w-full max-w-xs bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-foreground/50">{progress}%</p>
      </div>
    );
  }

  if (view === 'preview') {
    return (
      <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Prévisualisation</h2>
          <button onClick={() => setView('upload')} className="text-foreground/40 hover:text-foreground text-lg">✕</button>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300">{validCount} valide{validCount > 1 ? 's' : ''}</span>
          {errorCount > 0 && <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
          {rows.some((r) => r.warnings.length > 0) && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{rows.filter((r) => r.warnings.length > 0).length} avertissement{rows.filter((r) => r.warnings.length > 0).length > 1 ? 's' : ''}</span>}
        </div>

        <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-150">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Prénom</th>
                <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Nom</th>
                <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Email</th>
                <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Pupitre</th>
                <th className="text-left px-3 py-2 text-xs text-foreground/50 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-border last:border-0 ${row.errors.length > 0 ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}>
                  <td className="px-3 py-2 text-foreground">{row.first_name || <span className="text-red-500 italic">—</span>}</td>
                  <td className="px-3 py-2 text-foreground">{row.last_name || <span className="text-red-500 italic">—</span>}</td>
                  <td className="px-3 py-2 text-foreground/70 font-mono text-xs">{row.email}</td>
                  <td className="px-3 py-2 text-foreground/60 text-xs">
                    {row.voice_part_id
                      ? voiceParts.find((v) => v.id === row.voice_part_id)?.name
                      : row.voice_part_name
                        ? <span className="text-amber-600">{row.voice_part_name}</span>
                        : <span className="text-foreground/30">—</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.errors.length > 0 ? (
                      <span className="text-red-600">{row.errors.join(', ')}</span>
                    ) : row.warnings.length > 0 ? (
                      <span className="text-amber-600">{row.warnings.join(', ')}</span>
                    ) : (
                      <span className="text-green-600">✓ OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendEmails}
            onChange={(e) => setSendEmails(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm text-foreground/70">
            Envoyer les emails d&apos;invitation
            <span className="text-foreground/40 text-xs block">Sans email : les passphrases s&apos;affichent dans les résultats</span>
          </span>
        </label>

        {errorCount > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Les lignes en erreur seront ignorées. Seuls les {validCount} membres valides seront importés.
          </p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={() => setView('upload')}>Retour</Button>
          <Button onClick={handleImport} disabled={validCount === 0}>
            Importer {validCount} membre{validCount > 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Importer des membres via CSV</h2>
        <button onClick={onCloseAction} className="text-foreground/40 hover:text-foreground text-lg">✕</button>
      </div>

      <div className="flex flex-col gap-2 text-xs text-foreground/60 bg-background border border-border rounded-xl p-4">
        <p className="font-medium text-foreground/80">Format attendu</p>
        <code className="font-mono text-foreground/50">prénom,nom,email,pupitre,saison,téléphone,adresse,code_postal,ville,date_de_naissance</code>
        <p>
          Colonnes <span className="font-medium text-foreground/70">obligatoires</span> : prénom, nom, email.{' '}
          <span className="font-medium text-foreground/70">Optionnelles</span> : pupitre, saison, téléphone, adresse, code postal, ville, date de naissance <span className="text-foreground/40">(AAAA-MM-JJ)</span>.
        </p>
        <button
          onClick={downloadTemplate}
          className="self-start text-primary hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          Télécharger le modèle .csv
        </button>
      </div>

      <label
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) parseFile(file);
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div className="text-center">
          <p className="text-sm text-foreground/60">Glisser-déposer un fichier CSV</p>
          <p className="text-xs text-foreground/40">ou cliquer pour parcourir</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
          }}
        />
      </label>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onCloseAction}>Annuler</Button>
      </div>
    </div>
  );
}
