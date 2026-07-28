import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import { r2, R2_IMAGES_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { createServerClient } from '@/lib/supabase.server';
import { getMemberRole } from '@/components/features/membres/queries';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = await getMemberRole(user.id);
  if (!['ca', 'admin', 'super_admin'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload PDF
  const key = `documents/ca/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_IMAGES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }));
  } catch {
    return NextResponse.json({ error: 'Erreur upload PDF' }, { status: 500 });
  }
  const pdfUrl = `${R2_PUBLIC_URL}/${key}`;

  try {
    const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
    const html = textToHtml(Array.isArray(text) ? text.join('\n') : text);
    return NextResponse.json({ html, pdfUrl });
  } catch (err) {
    console.error('[extract-pdf]', err);
    return NextResponse.json({ html: '', pdfUrl, error: 'Extraction échouée' });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function textToHtml(text: string): string {
  // Nettoyer le texte
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Ajouter des sauts avant les patterns structurants
    .replace(/(\d+\.\s+[A-ZÀÁÂÄÉÈÊËÎÏÔÙÛÜ])/g, '\n$1')
    .replace(/(Présents\s*:)/gi, '\nPrésents :')
    .replace(/(Absents\s*:)/gi, '\nAbsents :')
    .replace(/(Ordre du jour\s*:)/gi, '\nOrdre du jour :')
    .replace(/(EN COURS|A RETENIR|ATTENTION)/g, '\n$1')
    .replace(/([.!?])\s+([A-ZÀÁÂÄÉÈÊËÎÏÔÙÛÜ])/g, '$1\n$2')
    .replace(/\s*•\s*/g, '\n• ')
    .replace(/\s*→\s*/g, '\n→ ')
    // Nettoyer les sauts multiples
    .replace(/\n{3,}/g, '\n\n');

  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const htmlLines: string[] = [];

  for (const line of lines) {
    // Titre principal tout en majuscules
    const isAllCaps =
      line === line.toUpperCase() &&
      line.length > 4 &&
      /[A-ZÀÁÂÄÉÈÊËÎÏÔÙÛÜ]{3,}/.test(line) &&
      !/^\d/.test(line);

    // Section numérotée : "1. Titre", "2. Titre"
    const isNumberedSection = /^\d+\.\s+[A-ZÀÁÂÄÉÈÊËÎÏÔÙÛÜ]/.test(line);

    // Label type "Présents :", "Ordre du jour :"
    const isLabel = /^[A-ZÀÁÂÄÉÈÊËÎÏÔÙÛÜ][a-zàáâäéèêëîïôùûü\s]+\s*:/.test(line) && line.length < 60;

    // Puce classique
    const isBullet = /^[•\-–]\s/.test(line);
    const isArrow = /^→\s/.test(line);

    // Date / évènement
    const isDate =
      /^\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i.test(
        line,
      );

    const safe = escapeHtml(line);
    if (isAllCaps) {
      htmlLines.push(`<h2>${safe}</h2>`);
    } else if (isNumberedSection) {
      htmlLines.push(`<h3>${safe}</h3>`);
    } else if (isLabel) {
      htmlLines.push(`<p><strong>${safe}</strong></p>`);
    } else if (isBullet || isArrow) {
      const content = escapeHtml(line.replace(/^[•\-–→]\s/, ''));
      htmlLines.push(`<li>${content}</li>`);
    } else if (isDate) {
      htmlLines.push(`<li><strong>${safe}</strong></li>`);
    } else {
      htmlLines.push(`<p>${safe}</p>`);
    }
  }

  // Regrouper les <li> dans <ul>
  const result: string[] = [];
  let inList = false;

  for (const line of htmlLines) {
    if (line.startsWith('<li>')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(line);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) result.push('</ul>');

  return result.join('\n');
}
