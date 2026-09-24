/**
 * Comprehensive migration: Supabase Storage → Cloudflare R2
 *
 * Migrates:
 *   - song_files (all types)         → private R2 (r2:// prefix)
 *   - news_files                     → public R2
 *   - external_event_files           → public R2
 *   - partners.logo_url              → public R2
 *   - ca_meetings.pdf_url            → public R2
 *   - content_blocks sponsor_dossier → public R2
 *
 * Usage:
 *   npx tsx scripts/migrate-supabase-to-r2.ts
 *   npx tsx scripts/migrate-supabase-to-r2.ts --only=song_files,news_files
 *   npx tsx scripts/migrate-supabase-to-r2.ts --delete
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const R2_PRIVATE_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_PUBLIC_BUCKET = process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME!;
const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? '').replace(/\/+$/, '');

const shouldDelete = process.argv.includes('--delete');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const onlyTables = onlyArg ? onlyArg.replace('--only=', '').split(',') : null;

function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage');
}

function extractSupabasePath(url: string, bucket: string): string {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) throw new Error(`Cannot find bucket "${bucket}" in URL: ${url}`);
  return decodeURIComponent(url.slice(idx + marker.length));
}

async function downloadFromSupabase(
  url: string,
  bucket: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  let fetchUrl: string;

  if (bucket === 'repertoire') {
    const path = extractSupabasePath(url, bucket);
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
    if (error || !data) throw new Error(`Signed URL failed for ${url}: ${error?.message}`);
    fetchUrl = data.signedUrl;
  } else {
    // Public bucket — fetch directly
    fetchUrl = url;
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  return { buffer, contentType };
}

async function uploadToR2Private(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_PRIVATE_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `r2://${key}`;
}

async function uploadToR2Public(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_PUBLIC_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

async function deleteFromSupabase(bucket: string, url: string): Promise<void> {
  const path = extractSupabasePath(url, bucket);
  await supabase.storage.from(bucket).remove([path]);
}

// ─── Migrations ───────────────────────────────────────────────────────────────

type RowMigration = {
  title: string; // en-tête affiché, ex. « news_files »
  table: string;
  column: string; // colonne contenant l'URL du fichier
  labelColumn: string; // colonne affichée dans les logs
  bucket: string; // bucket Supabase d'origine
  unit: string; // « fichier(s) », « logo(s) »…
  isPrivate?: boolean; // bucket R2 privé (clé = chemin brut, URL r2://)
};

// Migre toutes les lignes d'une table dont le fichier est encore sur Supabase Storage
async function migrateRows(m: RowMigration) {
  console.log(`\n📂 ${m.title}`);
  const query = supabase.from(m.table).select(`id, ${m.column}, ${m.labelColumn}`);
  const { data, error } = m.isPrivate
    ? await query.not(m.column, 'like', 'r2://%')
    : await query.like(m.column, '%supabase.co%');
  if (error) throw error;
  const rows = (data ?? []) as unknown as Record<string, string>[];
  if (!rows.length) {
    console.log('  ✅ Rien à migrer');
    return;
  }
  console.log(`  ${rows.length} ${m.unit} à migrer`);

  let ok = 0,
    ko = 0;
  for (const row of rows) {
    const url = row[m.column]!;
    const label = row[m.labelColumn] ?? row.id;
    try {
      const path = extractSupabasePath(url, m.bucket);
      const { buffer, contentType } = await downloadFromSupabase(url, m.bucket);
      const newUrl = m.isPrivate
        ? await uploadToR2Private(path, buffer, contentType)
        : await uploadToR2Public(`${m.bucket}/${path}`, buffer, contentType);
      const { error: upErr } = await supabase
        .from(m.table)
        .update({ [m.column]: newUrl })
        .eq('id', row.id);
      if (upErr) throw upErr;
      if (shouldDelete) await deleteFromSupabase(m.bucket, url);
      ok++;
      console.log(`  ✓ [${ok}/${rows.length}] ${label}`);
    } catch (err) {
      ko++;
      console.error(`  ✗ ${label}`, err);
    }
  }
  console.log(`  → ${ok} ok, ${ko} échec(s)`);
}
async function migrateSponsorDossier() {
  console.log('\n📂 content_blocks (dossier de sponsoring)');
  const { data: block, error } = await supabase
    .from('content_blocks')
    .select('page, block_key, content')
    .eq('page', 'partners')
    .eq('block_key', 'sponsor_dossier_url')
    .single();
  if (error || !block) {
    console.log('  ✅ Rien à migrer');
    return;
  }
  if (!isSupabaseUrl(block.content)) {
    console.log('  ✅ Déjà sur R2');
    return;
  }

  try {
    const path = extractSupabasePath(block.content, 'documents');
    const key = `documents/${path}`;
    const { buffer, contentType } = await downloadFromSupabase(block.content, 'documents');
    const newUrl = await uploadToR2Public(key, buffer, contentType);
    await supabase
      .from('content_blocks')
      .update({ content: newUrl })
      .eq('page', 'partners')
      .eq('block_key', 'sponsor_dossier_url');
    if (shouldDelete) await deleteFromSupabase('documents', block.content);
    console.log('  ✓ Dossier migré');
  } catch (err) {
    console.error('  ✗ Échec dossier sponsoring', err);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ALL_TASKS: Record<string, () => Promise<void>> = {
  song_files: () =>
    migrateRows({
      title: 'song_files (audio + score + lyrics)',
      table: 'song_files',
      column: 'file_url',
      labelColumn: 'label',
      bucket: 'repertoire',
      unit: 'fichier(s)',
      isPrivate: true,
    }),
  news_files: () =>
    migrateRows({
      title: 'news_files',
      table: 'news_files',
      column: 'file_url',
      labelColumn: 'label',
      bucket: 'documents',
      unit: 'fichier(s)',
    }),
  event_files: () =>
    migrateRows({
      title: 'external_event_files',
      table: 'external_event_files',
      column: 'file_url',
      labelColumn: 'label',
      bucket: 'documents',
      unit: 'fichier(s)',
    }),
  partners: () =>
    migrateRows({
      title: 'partners.logo_url',
      table: 'partners',
      column: 'logo_url',
      labelColumn: 'name',
      bucket: 'partners',
      unit: 'logo(s)',
    }),
  ca_meetings: () =>
    migrateRows({
      title: 'ca_meetings.pdf_url',
      table: 'ca_meetings',
      column: 'pdf_url',
      labelColumn: 'title',
      bucket: 'documents',
      unit: 'PV(s)',
    }),
  sponsor_dossier: migrateSponsorDossier,
};
async function main() {
  const tasks = onlyTables
    ? onlyTables.map((t) => {
        if (!ALL_TASKS[t])
          throw new Error(
            `Table inconnue : ${t}. Valeurs valides : ${Object.keys(ALL_TASKS).join(', ')}`,
          );
        return ALL_TASKS[t];
      })
    : Object.values(ALL_TASKS);

  console.log('🚀 Migration Supabase Storage → Cloudflare R2');
  if (shouldDelete) console.log('🗑  Mode --delete : fichiers Supabase supprimés après migration');
  else console.log('ℹ️  Sans --delete : les fichiers Supabase sont conservés');

  for (const task of tasks) {
    await task();
  }

  console.log('\n─────────────────────────────────────────────────');
  console.log('✅ Migration terminée');
  if (!shouldDelete) console.log('💡 Relance avec --delete pour supprimer les fichiers Supabase.');
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
