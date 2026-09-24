import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { addFooter, addHeader, drawBarChart, formatDate, PRIMARY } from './pdfLayout';
import { addChoicePupitreTable, addRatingPupitreTable } from './pdfPupitreTables';
import { formatAnswer } from './pollStats';
import type { PollResults } from './types';

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
      if (y + chartHeight > 270) {
        doc.addPage();
        y = 20;
      }
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
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
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
      const name = [resp.member.first_name, resp.member.last_name].filter(Boolean).join(' ') || '—';
      const pupitre = resp.member.voice_part?.name ?? '—';
      const date = formatDate(resp.submitted_at);
      const answers = results.question_results.map((qr) => formatAnswer(resp, qr));
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

  const slug = results.poll.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  doc.save(`sondage-${slug}-resultats.pdf`);
}
