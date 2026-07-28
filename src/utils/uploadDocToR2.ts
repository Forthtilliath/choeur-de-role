export async function uploadDocToR2(file: File, key: string): Promise<string> {
  const contentType = file.type || 'application/octet-stream';
  const res = await fetch('/api/r2/presign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType }),
  });
  if (!res.ok) throw new Error('Presign failed');
  const { presignUrl, publicUrl } = await res.json();
  const upload = await fetch(presignUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!upload.ok) throw new Error('Upload R2 failed');
  return publicUrl;
}
