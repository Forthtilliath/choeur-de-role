import type jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { choiceCountsByPupitre, isPupitre, ratingsByPupitre, ratingSummary } from './pollStats';
import type { OptionResult, PollResponse } from './types';

// Tableaux de répartition des réponses par pupitre (questions à choix et notes)
export function addChoicePupitreTable(
  doc: jsPDF,
  startY: number,
  margin: number,
  questionId: string,
  options: OptionResult[],
  responses: PollResponse[],
): number {
  const pupitreMap = choiceCountsByPupitre(responses, questionId);

  if (pupitreMap.size === 0) return startY;

  const pupitres = [...pupitreMap.keys()].sort();
  const head = [['Pupitre', ...options.map((o) => o.label), 'Total']];
  const body = pupitres.map((p) => {
    const counts = pupitreMap.get(p)!;
    const rowTotal = Object.values(counts).reduce((a, b) => a + b, 0);
    const total = responses.filter((r) => isPupitre(r, p)).length;

    return [
      p,
      ...options.map((o) => {
        const n = counts[o.option_id] ?? 0;
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        return n > 0 ? `${n} (${pct}%)` : '—';
      }),
      String(rowTotal),
    ];
  });

  autoTable(doc, {
    startY,
    head,
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: {
      fillColor: [230, 230, 245],
      textColor: [80, 80, 120],
      fontSize: 7,
      fontStyle: 'bold',
    },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: margin + 2, right: margin },
  });

  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
}

export function addRatingPupitreTable(
  doc: jsPDF,
  startY: number,
  margin: number,
  questionId: string,
  responses: PollResponse[],
): number {
  const pupitreMap = ratingsByPupitre(responses, questionId);

  if (pupitreMap.size === 0) return startY;

  const pupitres = [...pupitreMap.keys()].sort();
  const head = [['Pupitre', '1 ★', '2 ★', '3 ★', '4 ★', '5 ★', 'Moy.']];
  const body = pupitres.map((p) => {
    const { avg, dist } = ratingSummary(pupitreMap.get(p)!);

    return [p, ...[1, 2, 3, 4, 5].map((n) => (dist[n] ? String(dist[n]) : '—')), avg.toFixed(1)];
  });

  autoTable(doc, {
    startY,
    head,
    body,
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: {
      fillColor: [230, 230, 245],
      textColor: [80, 80, 120],
      fontSize: 7,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 },
      6: { fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: margin + 2, right: margin },
  });

  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
}
