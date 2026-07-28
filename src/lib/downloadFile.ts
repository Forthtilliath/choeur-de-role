// Ouvre le fichier dans un nouvel onglet via URL signée
export async function openSignedUrl(fileUrl: string) {
  const res = await fetch(`/api/repertoire/signed-url?path=${encodeURIComponent(fileUrl)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Impossible d\'ouvrir le fichier');
  }
  const data = await res.json();
  if (data.url) window.open(data.url, '_blank');
}

// Force le téléchargement via blob
export async function downloadFileFromSignedUrl(fileUrl: string, filename: string) {
  const res = await fetch(`/api/repertoire/signed-url?path=${encodeURIComponent(fileUrl)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Impossible de télécharger le fichier');
  }
  const data = await res.json();
  if (!data.url) throw new Error('URL non disponible');

  const fileRes = await fetch(data.url);
  if (!fileRes.ok) throw new Error('Fichier introuvable');
  const blob = await fileRes.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}
