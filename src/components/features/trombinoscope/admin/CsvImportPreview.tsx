'use client';

import { Button } from '@/components/ui/Button';

import type { VoicePart } from '../types';

import type { ParsedRow } from './csvImport';

const TH_CLASS = 'text-left px-3 py-2 text-xs text-foreground/50 font-medium';

type Props = {
  rows: ParsedRow[];
  voiceParts: VoicePart[];
  sendEmails: boolean;
  onSendEmailsChangeAction: (value: boolean) => void;
  onBackAction: () => void;
  onImportAction: () => void;
};

export function CsvImportPreview({
  rows,
  voiceParts,
  sendEmails,
  onSendEmailsChangeAction,
  onBackAction,
  onImportAction,
}: Props) {
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const validCount = rows.length - errorCount;
  const warningCount = rows.filter((r) => r.warnings.length > 0).length;

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Prévisualisation</h2>
        <button onClick={onBackAction} className="text-foreground/40 hover:text-foreground text-lg">
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300">
          {validCount} valide{validCount > 1 ? 's' : ''}
        </span>
        {errorCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
            {errorCount} erreur{errorCount > 1 ? 's' : ''}
          </span>
        )}
        {warningCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            {warningCount} avertissement
            {warningCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className={TH_CLASS}>Prénom</th>
              <th className={TH_CLASS}>Nom</th>
              <th className={TH_CLASS}>Email</th>
              <th className={TH_CLASS}>Pupitre</th>
              <th className={TH_CLASS}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.lineNumber}
                className={`border-b border-border last:border-0 ${row.errors.length > 0 ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
              >
                <td className="px-3 py-2 text-foreground">
                  {row.first_name || <span className="text-red-500 italic">—</span>}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {row.last_name || <span className="text-red-500 italic">—</span>}
                </td>
                <td className="px-3 py-2 text-foreground/70 font-mono text-xs">{row.email}</td>
                <td className="px-3 py-2 text-foreground/60 text-xs">
                  {row.voice_part_id ? (
                    voiceParts.find((v) => v.id === row.voice_part_id)?.name
                  ) : row.voice_part_name ? (
                    <span className="text-amber-600">{row.voice_part_name}</span>
                  ) : (
                    <span className="text-foreground/30">—</span>
                  )}
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
          onChange={(e) => onSendEmailsChangeAction(e.target.checked)}
          className="w-4 h-4 accent-primary rounded"
        />
        <span className="text-sm text-foreground/70">
          Envoyer les emails d&apos;invitation
          <span className="text-foreground/40 text-xs block">
            Sans email : les passphrases s&apos;affichent dans les résultats
          </span>
        </span>
      </label>

      {errorCount > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Les lignes en erreur seront ignorées. Seuls les {validCount} membres valides seront
          importés.
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onBackAction}>
          Retour
        </Button>
        <Button onClick={onImportAction} disabled={validCount === 0}>
          Importer {validCount} membre{validCount > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
