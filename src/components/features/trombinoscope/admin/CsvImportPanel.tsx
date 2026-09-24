'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import type { ImportRowResult } from '@/app/api/admin/bulk-import-members/route';

import type { Season } from '../../concerts';
import type { AdminMemberWithSeasons, VoicePart } from '../types';

import type { ParsedRow } from './csvImport';
import { parseMembersCsv } from './csvImport';
import { CsvImportPreview } from './CsvImportPreview';
import { CsvImportResults } from './CsvImportResults';
import { CsvImportUpload } from './CsvImportUpload';

type Props = {
  voiceParts: VoicePart[];
  seasons: Season[];
  onCloseAction: () => void;
  onSuccessAction: (members: AdminMemberWithSeasons[]) => void;
};

export function CsvImportPanel({ voiceParts, seasons, onCloseAction, onSuccessAction }: Props) {
  const [view, setView] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [sendEmails, setSendEmails] = useState(true);
  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [progress, setProgress] = useState(0);

  function parseFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseMembersCsv(e.target?.result as string, voiceParts, seasons);
      if ('error' in parsed) {
        toast.error(parsed.error);
        return;
      }
      setRows(parsed.rows);
      setView('preview');
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.errors.length === 0);
    setView('importing');
    setProgress(0);

    const batchResults: ImportRowResult[] = [];
    for (const [i, row] of validRows.entries()) {
      const res = await fetch('/api/admin/bulk-import-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: [
            {
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
            },
          ],
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
      toast.success(
        `${successCount} membre${successCount > 1 ? 's' : ''} importé${successCount > 1 ? 's' : ''}`,
      );
    }
  }

  if (view === 'results') {
    return <CsvImportResults results={results} onCloseAction={() => onSuccessAction([])} />;
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
      <CsvImportPreview
        rows={rows}
        voiceParts={voiceParts}
        sendEmails={sendEmails}
        onSendEmailsChangeAction={setSendEmails}
        onBackAction={() => setView('upload')}
        onImportAction={handleImport}
      />
    );
  }

  return <CsvImportUpload onFileAction={parseFile} onCloseAction={onCloseAction} />;
}
