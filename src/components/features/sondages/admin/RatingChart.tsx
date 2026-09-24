'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ratingsByPupitre, ratingSummary } from '../pollStats';
import type { PollResponse } from '../types';

import { COLORS, formatAnswerCount } from './pollChartUtils';

export function RatingChart({
  distribution,
  average,
  total,
  questionId,
  responses,
}: {
  distribution: Record<number, number>;
  average: number;
  total: number;
  questionId: string;
  responses: PollResponse[];
}) {
  const data = [1, 2, 3, 4, 5].map((n) => ({
    name: `${n} ★`,
    count: distribution[n] ?? 0,
  }));

  // Répartition par pupitre
  const pupitreMap = ratingsByPupitre(responses, questionId);

  const pupitres = [...pupitreMap.keys()].sort();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/60">
        Moyenne : <span className="font-semibold text-foreground">{average.toFixed(1)}</span> / 5 (
        {total} réponse{total !== 1 ? 's' : ''})
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={formatAnswerCount} />
          <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {pupitres.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-foreground/50">Pupitre</th>
                {[1, 2, 3, 4, 5].map((n) => (
                  <th key={n} className="px-3 py-2 text-center font-medium text-foreground/50">
                    {n} ★
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium text-foreground/50">Moy.</th>
              </tr>
            </thead>
            <tbody>
              {pupitres.map((pupitre) => {
                const { avg, dist } = ratingSummary(pupitreMap.get(pupitre)!);

                return (
                  <tr key={pupitre} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium text-foreground/70">{pupitre}</td>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <td key={n} className="px-3 py-2 text-center text-foreground/70">
                        {dist[n] ? (
                          <span className="font-medium">{dist[n]}</span>
                        ) : (
                          <span className="text-foreground/25">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold text-foreground">
                      {avg.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
