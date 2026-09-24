// ── Cache URL signée ────────────────────────────────────────────

const CACHE_TTL = 3000; // 50 min en secondes

function getCachedUrl(fileUrl: string): string | null {
  try {
    const raw = sessionStorage.getItem(`r2_url:${fileUrl}`);
    if (!raw) return null;
    const { url, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(`r2_url:${fileUrl}`);
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function setCachedUrl(fileUrl: string, url: string): void {
  try {
    sessionStorage.setItem(
      `r2_url:${fileUrl}`,
      JSON.stringify({ url, expiresAt: Date.now() + CACHE_TTL * 1000 }),
    );
  } catch {
    // Cache best-effort — sessionStorage indisponible (quota, navigation privée...) : ignoré volontairement.
  }
}

export async function fetchSignedUrl(fileUrl: string): Promise<string> {
  const cached = getCachedUrl(fileUrl);
  if (cached) return cached;
  const res = await fetch(`/api/repertoire/signed-url?path=${encodeURIComponent(fileUrl)}`);
  if (!res.ok) throw new Error(`Signed URL error: ${res.status}`);
  const data = await res.json();
  if (!data.url) throw new Error('URL non disponible');
  setCachedUrl(fileUrl, data.url);
  return data.url;
}

// ── Téléchargement ──────────────────────────────────────────────

// Télécharge un fichier R2 via la route dédiée ; renvoie false pour un fichier legacy (non R2)
export function triggerR2Download(fileUrl: string, downloadName: string): boolean {
  if (!fileUrl.startsWith('r2://')) return false;
  const params = new URLSearchParams({ path: fileUrl, filename: downloadName });
  const a = document.createElement('a');
  a.href = `/api/repertoire/r2-download?${params}`;
  a.download = downloadName;
  a.click();
  return true;
}

// ── Volume global ───────────────────────────────────────────────

const VOLUME_KEY = 'audio_global_volume';

export function getStoredVolume(): number {
  try {
    const v = localStorage.getItem(VOLUME_KEY);
    return v ? Math.min(1, Math.max(0, parseFloat(v))) : 0.5;
  } catch {
    return 0.5;
  }
}

export function broadcastVolume(v: number): void {
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {
    // localStorage indisponible (quota, navigation privée...) : ignoré volontairement.
  }
  document.querySelectorAll('audio').forEach((el) => {
    (el as HTMLAudioElement).volume = v;
  });
  window.dispatchEvent(new CustomEvent('audio-volume-change', { detail: v }));
}

export function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}
