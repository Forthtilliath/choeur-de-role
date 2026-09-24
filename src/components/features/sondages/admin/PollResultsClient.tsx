'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

import { exportResultsPdf } from '../pdfExport';
import type { PollResults } from '../types';

import { QuestionResultCard } from './QuestionResultCard';
import { ResponsesTable } from './ResponsesTable';
type Props = {
  results: PollResults;
  onBackAction: () => void;
};

export function PollResultsClient({ results, onBackAction }: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportResultsPdf(results);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{results.poll.title}</h2>
          {results.poll.description && (
            <p className="text-sm text-foreground/50 mt-0.5">{results.poll.description}</p>
          )}
          <p className="text-sm text-foreground/40 mt-1">
            {results.total_responses} réponse{results.total_responses !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" onClick={onBackAction}>
            ← Retour
          </Button>
          <Button variant="outline-secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Export...' : '⬇ PDF résultats'}
          </Button>
        </div>
      </div>

      {results.total_responses === 0 ? (
        <div className="text-center py-12 text-foreground/40">
          <p>Aucune réponse pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {results.question_results.map((qr, i) => (
            <QuestionResultCard
              key={qr.question_id}
              result={qr}
              index={i}
              responses={results.responses}
            />
          ))}

          <ResponsesTable results={results} />
        </div>
      )}
    </div>
  );
}
