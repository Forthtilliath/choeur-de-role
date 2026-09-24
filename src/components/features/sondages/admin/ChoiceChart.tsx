'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { choiceCountsByPupitre } from '../pollStats';
import type { PollResponse } from '../types';

import { COLORS, formatAnswerCount } from './pollChartUtils';

type ChoiceOption = { option_id: string; label: string; count: number };

export function ChoiceChart({
  options,
  total,
  questionId,
  responses,
}: {
  options: ChoiceOption[];
  total: number;
  questionId: string;
  responses: PollResponse[];
}) {
  const data = options.map((o) => ({
    id: o.option_id,
    name: o.label,
    count: o.count,
    pct: total > 0 ? Math.round((o.count / total) * 100) : 0,
  }));

  // Répartition par pupitre
  const pupitreMap = choiceCountsByPupitre(responses, questionId);

  const pupitres = [...pupitreMap.keys()].sort();

  const chart =
    options.length <= 5 ? (
      <ResponsiveContainer width="100%" height={Math.max(120, options.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, total]} tickCount={Math.min(total + 1, 6)} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip formatter={formatAnswerCount} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={d.id} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
            >
              {data.map((d, i) => (
                <Cell key={d.id} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatAnswerCount} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 text-sm">
          {data.map((d, i) => (
            <div key={d.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-foreground/70">{d.name}</span>
              <span className="text-foreground/40 ml-auto pl-4">
                {d.count} ({d.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {chart}

      {pupitres.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-foreground/50">Pupitre</th>
                {options.map((o, i) => (
                  <th
                    key={o.option_id}
                    className="px-3 py-2 text-center font-medium"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    {o.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium text-foreground/50">Total</th>
              </tr>
            </thead>
            <tbody>
              {pupitres.map((pupitre) => {
                const counts = pupitreMap.get(pupitre)!;
                const rowTotal = Object.values(counts).reduce((a, b) => a + b, 0);
                return (
                  <tr key={pupitre} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium text-foreground/70">{pupitre}</td>
                    {options.map((o) => {
                      const n = counts[o.option_id] ?? 0;
                      const pct = rowTotal > 0 ? Math.round((n / rowTotal) * 100) : 0;
                      return (
                        <td key={o.option_id} className="px-3 py-2 text-center text-foreground/70">
                          {n > 0 ? (
                            <>
                              <span className="font-medium">{n}</span>
                              <span className="text-foreground/40"> ({pct}%)</span>
                            </>
                          ) : (
                            <span className="text-foreground/25">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-medium text-foreground/50">
                      {rowTotal}
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
