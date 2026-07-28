'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/Button';
import { PollResponse, PollResults, QuestionResult } from '../types';
import { exportResultsPdf } from '../pdfExport';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

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
            <QuestionResultCard key={qr.question_id} result={qr} index={i} responses={results.responses} />
          ))}

          {/* Table des réponses individuelles */}
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
                      {results.question_results.map((qr) => {
                        const ans = resp.poll_answers.filter((a) => a.question_id === qr.question_id);
                        const text =
                          qr.type === 'text'
                            ? (ans[0]?.text_value ?? '—')
                            : qr.type === 'rating'
                              ? (ans[0]?.number_value?.toString() ?? '—')
                              : ans.length === 0
                                ? '—'
                                : ans
                                    .map((a) => qr.options?.find((o) => o.option_id === a.option_id)?.label ?? '?')
                                    .join(', ');
                        return (
                          <td key={qr.question_id} className="px-4 py-2">
                            {text}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionResultCard({ result, index, responses }: { result: QuestionResult; index: number; responses: PollResponse[] }) {
  return (
    <div className="border border-border rounded-2xl p-5 bg-background-secondary flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-foreground/40 mb-0.5">Question {index + 1}</p>
        <p className="text-sm font-semibold text-foreground">{result.text}</p>
        <p className="text-xs text-foreground/40 mt-0.5">{result.total_responses} réponse{result.total_responses !== 1 ? 's' : ''}</p>
      </div>

      {(result.type === 'single_choice' || result.type === 'multiple_choice') && result.options && (
        <ChoiceChart options={result.options} total={result.total_responses} questionId={result.question_id} responses={responses} />
      )}

      {result.type === 'rating' && result.rating_distribution !== undefined && (
        <RatingChart distribution={result.rating_distribution} average={result.average ?? 0} total={result.total_responses} questionId={result.question_id} responses={responses} />
      )}

      {result.type === 'text' && result.text_answers && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {result.text_answers.map((t, i) => (
            <p key={i} className="text-sm text-foreground/70 border-l-2 border-border pl-3">
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

type ChoiceOption = { option_id: string; label: string; count: number };

function ChoiceChart({
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
    name: o.label,
    count: o.count,
    pct: total > 0 ? Math.round((o.count / total) * 100) : 0,
  }));

  // Répartition par pupitre
  const pupitreMap = new Map<string, Record<string, number>>();
  for (const resp of responses) {
    const pupitre = resp.member.voice_part?.name ?? 'Non renseigné';
    const qAnswers = resp.poll_answers.filter((a) => a.question_id === questionId);
    if (!pupitreMap.has(pupitre)) pupitreMap.set(pupitre, {});
    const entry = pupitreMap.get(pupitre)!;
    for (const ans of qAnswers) {
      if (ans.option_id) entry[ans.option_id] = (entry[ans.option_id] ?? 0) + 1;
    }
  }
  const pupitres = [...pupitreMap.keys()].sort();

  const chart =
    options.length <= 5 ? (
      <ResponsiveContainer width="100%" height={Math.max(120, options.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, total]} tickCount={Math.min(total + 1, 6)} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v} réponse${Number(v) !== 1 ? 's' : ''}`, '']} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v} réponse${Number(v) !== 1 ? 's' : ''}`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 text-sm">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-foreground/70">{d.name}</span>
              <span className="text-foreground/40 ml-auto pl-4">{d.count} ({d.pct}%)</span>
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
                  <th key={o.option_id} className="px-3 py-2 text-center font-medium" style={{ color: COLORS[i % COLORS.length] }}>
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
                          {n > 0 ? <><span className="font-medium">{n}</span><span className="text-foreground/40"> ({pct}%)</span></> : <span className="text-foreground/25">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-medium text-foreground/50">{rowTotal}</td>
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

function RatingChart({
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
  const pupitreMap = new Map<string, number[]>();
  for (const resp of responses) {
    const pupitre = resp.member.voice_part?.name ?? 'Non renseigné';
    const ans = resp.poll_answers.find((a) => a.question_id === questionId);
    if (ans?.number_value == null) continue;
    if (!pupitreMap.has(pupitre)) pupitreMap.set(pupitre, []);
    pupitreMap.get(pupitre)!.push(ans.number_value);
  }
  const pupitres = [...pupitreMap.keys()].sort();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/60">
        Moyenne : <span className="font-semibold text-foreground">{average.toFixed(1)}</span> / 5 ({total} réponse{total !== 1 ? 's' : ''})
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(v) => [`${v} réponse${Number(v) !== 1 ? 's' : ''}`, '']} />
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
                  <th key={n} className="px-3 py-2 text-center font-medium text-foreground/50">{n} ★</th>
                ))}
                <th className="px-3 py-2 text-center font-medium text-foreground/50">Moy.</th>
              </tr>
            </thead>
            <tbody>
              {pupitres.map((pupitre) => {
                const vals = pupitreMap.get(pupitre)!;
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                const dist: Record<number, number> = {};
                vals.forEach((v) => { dist[v] = (dist[v] ?? 0) + 1; });
                return (
                  <tr key={pupitre} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium text-foreground/70">{pupitre}</td>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <td key={n} className="px-3 py-2 text-center text-foreground/70">
                        {dist[n] ? <span className="font-medium">{dist[n]}</span> : <span className="text-foreground/25">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold text-foreground">{avg.toFixed(1)}</td>
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
