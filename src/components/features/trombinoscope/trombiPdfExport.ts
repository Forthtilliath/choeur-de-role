import type { jsPDF } from 'jspdf';

import type { Column, TrombiMember } from './types';

const CHOIR_NAME = 'Chœur de Rôle';

function todayFr() {
  return new Date().toLocaleDateString('fr-FR');
}

function formatPdfPhone(phone: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length === 10 ? digits.match(/.{2}/g)!.join(' ') : (phone ?? '');
}

function cellValue(m: TrombiMember, col: Column) {
  switch (col.key) {
    case 'voice_part':
      return m.voice_parts?.name ?? '';
    case 'first_name':
      return m.first_name ?? '';
    case 'last_name':
      return m.last_name ?? '';
    case 'address':
      return [m.address, m.zip_code, m.city].filter(Boolean).join(', ');
    case 'email':
      return m.email ?? '';
    case 'phone':
      return formatPdfPhone(m.phone);
    default:
      return '';
  }
}

// Liste tabulaire des choristes, colonnes visibles hors photo et CA
export async function exportMembersListPdf(members: TrombiMember[], columns: Column[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(`${CHOIR_NAME} — Liste des choristes`, 14, 16);
  doc.setFontSize(10);
  doc.text(`${members.length} choristes — ${todayFr()}`, 14, 23);

  const visibleCols = columns.filter((c) => c.visible && c.key !== 'photo' && c.key !== 'ca');
  const head = [visibleCols.map((c) => c.label)];
  const body = members.map((m) => visibleCols.map((col) => cellValue(m, col)));
  autoTable(doc, { head, body, startY: 28, styles: { fontSize: 9 } });
  doc.save('choristes.pdf');
}

async function fetchImageBase64(url: string): Promise<string | null> {
  try {
    const cleanUrl = url.split('?')[0] ?? url;
    const res = await fetch(`/api/r2/image-view?url=${encodeURIComponent(cleanUrl)}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawPlaceholder(doc: jsPDF, x: number, y: number, size: number, m: TrombiMember) {
  doc.setFillColor(220, 220, 220);
  doc.rect(x, y, size, size, 'F');
  const initials = `${(m.first_name ?? '?')[0]}${(m.last_name ?? '?')[0]}`.toUpperCase();
  doc.setFontSize(12);
  doc.setTextColor(150);
  doc.text(initials, x + size / 2, y + size / 2 + 4, { align: 'center' });
  doc.setTextColor(0);
}

function imageFormat(dataUrl: string) {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

const COLS = 5;
const CELL_W = 38;
const CELL_H = 54;
const MARGIN_Y = 26;
const PHOTO_SIZE = 30;

// Trombinoscope en grille de 5 colonnes : photo (ou initiales), nom et pupitre
export async function exportTrombiPdf(members: TrombiMember[]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.text(`Trombinoscope — ${CHOIR_NAME}`, pageW / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${members.length} choristes — ${todayFr()}`, pageW / 2, 20, { align: 'center' });
  doc.setTextColor(0);

  const marginX = (pageW - COLS * CELL_W) / 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  const itemsPerPage = Math.floor((pageHeight - MARGIN_Y) / CELL_H) * COLS;

  const photoMap = new Map<string, string | null>();
  await Promise.all(
    members
      .filter((m) => m.photo_url)
      .map(async (m) => {
        photoMap.set(m.id, await fetchImageBase64(m.photo_url!));
      }),
  );

  let currentPage = 0;
  for (const [i, m] of members.entries()) {
    const indexOnPage = i % itemsPerPage;
    const newPage = Math.floor(i / itemsPerPage);
    if (newPage > currentPage) {
      doc.addPage();
      currentPage = newPage;
    }

    const x = marginX + (indexOnPage % COLS) * CELL_W;
    const y = MARGIN_Y + Math.floor(indexOnPage / COLS) * CELL_H;

    const photoB64 = photoMap.get(m.id);
    if (photoB64) {
      try {
        doc.addImage(photoB64, imageFormat(photoB64), x, y, PHOTO_SIZE, PHOTO_SIZE);
      } catch {
        drawPlaceholder(doc, x, y, PHOTO_SIZE, m);
      }
    } else {
      drawPlaceholder(doc, x, y, PHOTO_SIZE, m);
    }

    doc.setFontSize(8);
    doc.setTextColor(0);
    const fullName = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
    const nameLines = doc.splitTextToSize(fullName, CELL_W - 2);
    doc.text(nameLines, x + PHOTO_SIZE / 2, y + PHOTO_SIZE + 5, { align: 'center' });

    if (m.voice_parts?.name) {
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(m.voice_parts.name, x + PHOTO_SIZE / 2, y + PHOTO_SIZE + 11, { align: 'center' });
      doc.setTextColor(0);
    }
  }
  doc.save('trombinoscope.pdf');
}
