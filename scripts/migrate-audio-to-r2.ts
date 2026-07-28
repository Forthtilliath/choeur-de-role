/**
 * Migration des fichiers audio de Supabase Storage vers Cloudflare R2.
 * Usage : npx tsx scripts/migrate-audio-to-r2.ts
 * Ajouter --delete pour supprimer les fichiers de Supabase après migration.
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

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const shouldDelete = process.argv.includes('--delete');

async function migrate() {
  console.log('🔍 Récupération des fichiers audio depuis Supabase...\n');

  const { data: files, error } = await supabase
    .from('song_files')
    .select('id, file_url, label, type')
    .eq('type', 'audio')
    .not('file_url', 'like', 'r2://%'); // ignorer les déjà migrés

  if (error) throw error;
  if (!files || files.length === 0) {
    console.log('✅ Aucun fichier à migrer.');
    return;
  }

  console.log(`📦 ${files.length} fichiers à migrer vers R2`);
  if (shouldDelete) console.log('🗑  Mode --delete activé : suppression Supabase après migration\n');
  else console.log('ℹ️  Sans --delete : les fichiers Supabase seront conservés\n');

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const label = file.label || file.id;
    try {
      // Extraire le chemin relatif depuis l'URL publique Supabase
      const urlParts = file.file_url.split('/repertoire/');
      const storagePath = urlParts[urlParts.length - 1];

      // Générer une URL signée pour télécharger depuis Supabase
      const { data: signed, error: signErr } = await supabase.storage
        .from('repertoire')
        .createSignedUrl(storagePath, 300);
      if (signErr || !signed) throw signErr ?? new Error('Signed URL manquante');

      // Télécharger le fichier
      const response = await fetch(signed.signedUrl);
      if (!response.ok) throw new Error(`Téléchargement échoué (HTTP ${response.status})`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') ?? 'audio/mpeg';

      // Uploader vers R2
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: storagePath,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      // Mettre à jour file_url en DB
      const { error: updateErr } = await supabase
        .from('song_files')
        .update({ file_url: `r2://${storagePath}` })
        .eq('id', file.id);
      if (updateErr) throw updateErr;

      // Supprimer de Supabase si --delete
      if (shouldDelete) {
        await supabase.storage.from('repertoire').remove([storagePath]);
      }

      success++;
      console.log(`✓ [${success}/${files.length}] ${label}`);
    } catch (err) {
      failed++;
      console.error(`✗ [ÉCHEC] ${label}`, err);
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`✅ Réussis  : ${success}`);
  if (failed > 0) console.log(`❌ Échecs   : ${failed}`);
  console.log(`─────────────────────────────────`);
  if (failed > 0) console.log('\nRelance le script pour re-tenter les échecs (les succès sont ignorés).');
}

migrate().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
