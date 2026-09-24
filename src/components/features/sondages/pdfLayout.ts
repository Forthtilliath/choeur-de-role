import type jsPDF from 'jspdf';

export const PRIMARY = [99, 102, 241] as const; // indigo-500

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function addHeader(doc: jsPDF, title: string, subtitle: string) {
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

export function addFooter(doc: jsPDF) {
  // jsPDF v4 exposes getNumberOfPages via internal
  const pages = (doc.internal as unknown as { pages: unknown[] }).pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`${i} / ${pages}`, 105, 292, { align: 'center' });
  }
}

export function drawBarChart(
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
