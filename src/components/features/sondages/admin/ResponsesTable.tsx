import { formatAnswer } from '../pollStats';
import type { PollResults } from '../types';

// Tableau des réponses individuelles : une ligne par choriste, une colonne par question
export function ResponsesTable({ results }: { results: PollResults }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border bg-background-secondary">
        <h3 className="text-sm font-semibold text-foreground">Réponses individuelles</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-foreground/50 text-xs">
              <th className="px-4 py-2 text-left font-medium">Choriste</th>
              <th className="px-4 py-2 text-left font-medium">Pupitre</th>
              <th className="px-4 py-2 text-left font-medium">Date</th>
              {results.question_results.map((qr, i) => (
                <th key={qr.question_id} className="px-4 py-2 text-left font-medium">
                  Q{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.responses.map((resp) => (
              <tr key={resp.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-4 py-2 whitespace-nowrap">
                  {[resp.member.first_name, resp.member.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-foreground/60">
                  {resp.member.voice_part?.name ?? '—'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-foreground/60">
                  {new Date(resp.submitted_at).toLocaleDateString('fr-FR')}
                </td>
                {results.question_results.map((qr) => (
                  <td key={qr.question_id} className="px-4 py-2">
                    {formatAnswer(resp, qr)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
