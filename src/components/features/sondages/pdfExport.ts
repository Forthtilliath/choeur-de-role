import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OptionResult, PollResponse, PollResults, QuestionResult } from './types';

const PRIMARY = [99, 102, 241] as const; // indigo-500

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Chœur de Rôle', 10, 9);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 105, 9, { align: 'center' });

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.text(subtitle, 105, 20, { align: 'center' });
}

function addFooter(doc: jsPDF) {
  // jsPDF v4 exposes getNumberOfPages via internal
  const pages = (doc.internal as unknown as { pages: unknown[] }).pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`${i} / ${pages}`, 105, 292, { align: 'center' });
  }
}

function drawBarChart(
  doc: jsPDF,
  data: { label: string; count: number }[],
  total: number,
  x: number,
  y: number,
  width: number,
  barHeight: number,
) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const labelWidth = 50;
  const barWidth = width - labelWidth - 20;

  data.forEach((d, i) => {
    const rowY = y + i * (barHeight + 3);
    const fill = d.count / maxCount;
    const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const label = d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label;
    doc.text(label, x, rowY + barHeight - 1);

    // bg track
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(x + labelWidth, rowY, barWidth, barHeight, 1, 1, 'F');

    // filled bar
    if (fill > 0) {
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(x + labelWidth, rowY, barWidth * fill, barHeight, 1, 1, 'F');
    }

    // count + pct
    doc.setTextColor(80, 80, 80);
    doc.text(`${d.count} (${pct}%)`, x + labelWidth + barWidth + 2, rowY + barHeight - 1);
  });
}

function addChoicePupitreTable(
  doc: jsPDF,
  startY: number,
  margin: number,
  questionId: string,
  options: OptionResult[],
  responses: PollResponse[],
): number {
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
  if (pupitreMap.size === 0) return startY;

  const pupitres = [...pupitreMap.keys()].sort();
  const head = [['Pupitre', ...options.map((o) => o.label), 'Total']];
  const body = pupitres.map((p) => {
    const counts = pupitreMap.get(p)!;
    const rowTotal = Object.values(counts).reduce((a, b) => a + b, 0);
    const total = responses.filter((r) => r.member.voice_part?.name === p || (!r.member.voice_part && p === 'Non renseigné')).length;
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
    headStyles: { fillColor: [230, 230, 245], textColor: [80, 80, 120], fontSize: 7, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: margin + 2, right: margin },
  });

  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
}

function addRatingPupitreTable(
  doc: jsPDF,
  startY: number,
  margin: number,
  questionId: string,
  responses: PollResponse[],
): number {
  const pupitreMap = new Map<string, number[]>();
  for (const resp of responses) {
    const pupitre = resp.member.voice_part?.name ?? 'Non renseigné';
    const ans = resp.poll_answers.find((a) => a.question_id === questionId);
    if (ans?.number_value == null) continue;
    if (!pupitreMap.has(pupitre)) pupitreMap.set(pupitre, []);
    pupitreMap.get(pupitre)!.push(ans.number_value);
  }
  if (pupitreMap.size === 0) return startY;

  const pupitres = [...pupitreMap.keys()].sort();
  const head = [['Pupitre', '1 ★', '2 ★', '3 ★', '4 ★', '5 ★', 'Moy.']];
  const body = pupitres.map((p) => {
    const vals = pupitreMap.get(p)!;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const dist: Record<number, number> = {};
    vals.forEach((v) => { dist[v] = (dist[v] ?? 0) + 1; });
    return [p, ...[1, 2, 3, 4, 5].map((n) => (dist[n] ? String(dist[n]) : '—')), avg.toFixed(1)];
  });

  autoTable(doc, {
    startY,
    head,
    body,
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: [230, 230, 245], textColor: [80, 80, 120], fontSize: 7, fontStyle: 'bold' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 }, 6: { fontStyle: 'bold' } },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: margin + 2, right: margin },
  });

  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
}

export async function exportResultsPdf(results: PollResults): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = 28;

  addHeader(doc, 'Résultats du sondage', `Généré le ${formatDate(new Date().toISOString())}`);

  // Title block
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(results.poll.title, margin, y);
  y += 6;

  if (results.poll.description) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(results.poll.description, margin, y);
    y += 5;
  }

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `${results.total_responses} réponse${results.total_responses !== 1 ? 's' : ''}${results.poll.closes_at ? ` · Clôturé le ${formatDate(results.poll.closes_at)}` : ''}`,
    margin,
    y,
  );
  y += 10;

  // Question results
  for (const [i, qr] of results.question_results.entries()) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(245, 245, 255);
    doc.roundedRect(margin, y - 4, 182, 8, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text(`Q${i + 1}. ${qr.text}`, margin + 2, y + 1.5);
    y += 9;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text(`${qr.total_responses} réponse${qr.total_responses !== 1 ? 's' : ''}`, margin + 2, y);
    y += 5;

    if ((qr.type === 'single_choice' || qr.type === 'multiple_choice') && qr.options) {
      const data = qr.options.map((o) => ({ label: o.label, count: o.count }));
      const chartHeight = data.length * 9;
      if (y + chartHeight > 270) { doc.addPage(); y = 20; }
      drawBarChart(doc, data, qr.total_responses, margin + 2, y, 176, 6);
      y += chartHeight + 4;
      y = addChoicePupitreTable(doc, y, margin, qr.question_id, qr.options, results.responses);
    } else if (qr.type === 'rating' && qr.rating_distribution !== undefined) {
      const avg = qr.average ?? 0;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`Moyenne : ${avg.toFixed(1)} / 5`, margin + 2, y);
      y += 5;
      const data = [1, 2, 3, 4, 5].map((n) => ({
        label: `${n} ★`,
        count: qr.rating_distribution![n] ?? 0,
      }));
      drawBarChart(doc, data, qr.total_responses, margin + 2, y, 176, 6);
      y += 5 * 9 + 4;
      y = addRatingPupitreTable(doc, y, margin, qr.question_id, results.responses);
    } else if (qr.type === 'text' && qr.text_answers) {
      for (const ans of qr.text_answers) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(`• ${ans}`, 170) as string[];
        doc.text(lines, margin + 4, y);
        y += lines.length * 4.5;
      }
      y += 4;
    }
  }

  // Individual responses table
  if (results.responses.length > 0) {
    doc.addPage();
    let ty = 20;
    addHeader(doc, 'Réponses individuelles', results.poll.title);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Réponses individuelles', margin, ty);
    ty += 8;

    const headers = [
      'Choriste',
      'Pupitre',
      'Date',
      ...results.question_results.map((_, i) => `Q${i + 1}`),
    ];

    const rows = results.responses.map((resp) => {
      const name =
        [resp.member.first_name, resp.member.last_name].filter(Boolean).join(' ') || '—';
      const pupitre = resp.member.voice_part?.name ?? '—';
      const date = formatDate(resp.submitted_at);
      const answers = results.question_results.map((qr: QuestionResult) => {
        const ans = resp.poll_answers.filter((a) => a.question_id === qr.question_id);
        if (qr.type === 'text') return ans[0]?.text_value ?? '—';
        if (qr.type === 'rating') return ans[0]?.number_value?.toString() ?? '—';
        return ans.length === 0
          ? '—'
          : ans
              .map((a) => qr.options?.find((o) => o.option_id === a.option_id)?.label ?? '?')
              .join(', ');
      });
      return [name, pupitre, date, ...answers];
    });

    autoTable(doc, {
      startY: ty,
      head: [headers],
      body: rows,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: PRIMARY as [number, number, number], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 248, 255] },
      margin: { left: margin, right: margin },
    });
  }

  addFooter(doc);

  const slug = results.poll.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  doc.save(`sondage-${slug}-resultats.pdf`);
}
