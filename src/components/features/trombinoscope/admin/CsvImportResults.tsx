'use client';

import { toast } from 'sonner';

import type { ImportRowResult } from '@/app/api/admin/bulk-import-members/route';
import { Button } from '@/components/ui/Button';

const TH_CLASS = 'text-left px-3 py-2 text-xs text-foreground/50 font-medium';

type Props = {
  results: ImportRowResult[];
  onCloseAction: () => void;
};

export function CsvImportResults({ results, onCloseAction }: Props) {
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
            ✅ {successRows.length} compte{successRows.length > 1 ? 's' : ''} créé
            {successRows.length > 1 ? 's' : ''}
            {!hasPassphrases && " — emails d'invitation envoyés"}
          </p>

          {hasPassphrases && (
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className={TH_CLASS}>Nom</th>
                    <th className={TH_CLASS}>Email</th>
                    <th className={TH_CLASS}>Passphrase</th>
                  </tr>
                </thead>
                <tbody>
                  {successRows.map((r) => (
                    <tr key={r.email} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="px-3 py-2 text-foreground/60 font-mono text-xs">{r.email}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                            {r.passphrase}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(r.passphrase ?? '');
                              toast.success('Copié');
                            }}
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
          <p className="text-sm text-red-600">
            ❌ {failedRows.length} échec{failedRows.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-col gap-1">
            {failedRows.map((r, i) => (
              <div
                // Résultats en lecture seule, un même e-mail peut échouer plusieurs fois
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={i}
                className="flex items-center gap-3 text-xs px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 rounded-lg"
              >
                <span className="text-foreground font-medium">
                  {r.first_name} {r.last_name}
                </span>
                <span className="text-foreground/50">{r.email}</span>
                <span className="text-red-600 dark:text-red-400 ml-auto">{r.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onCloseAction}>Fermer</Button>
      </div>
    </div>
  );
}
