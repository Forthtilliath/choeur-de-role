import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (hoisted pour être disponibles dans vi.mock) ───────────

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockGetUserQuery = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ isLoggedIn: true, isAdmin: true, id: 'user-1' }),
);

vi.mock('@/lib/r2', () => ({
  r2: { send: mockSend },
  R2_BUCKET: 'test-bucket',
}));

vi.mock('@/lib/auth', () => ({
  getUserQuery: mockGetUserQuery,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

// ── Import après les mocks ───────────────────────────────────────

import { POST } from '../route';

// ── Helpers ──────────────────────────────────────────────────────

function makeRequest(fields?: Record<string, string | File>) {
  const formData = new FormData();
  if (fields) {
    for (const [k, v] of Object.entries(fields)) formData.append(k, v);
  }
  return new Request('http://localhost/api/repertoire/upload-file', {
    method: 'POST',
    body: formData,
  });
}

const validFile = new File(['%PDF-1.4 content'], 'partition.pdf', { type: 'application/pdf' });

// ── Tests ────────────────────────────────────────────────────────

describe('POST /api/repertoire/upload-file', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
    mockGetUserQuery.mockResolvedValue({ isLoggedIn: true, isAdmin: true, id: 'user-1' });
  });

  it('retourne 403 si non authentifié', async () => {
    mockGetUserQuery.mockResolvedValueOnce({ isLoggedIn: false, isAdmin: false });
    const res = await POST(makeRequest({ key: 'songs/s1/test.pdf', file: validFile }));
    expect(res.status).toBe(403);
  });

  it('retourne 403 si authentifié mais non admin', async () => {
    mockGetUserQuery.mockResolvedValueOnce({ isLoggedIn: true, isAdmin: false, id: 'user-1' });
    const res = await POST(makeRequest({ key: 'songs/s1/test.pdf', file: validFile }));
    expect(res.status).toBe(403);
  });

  it('retourne 400 si le fichier est absent', async () => {
    const res = await POST(makeRequest({ key: 'songs/s1/test.pdf' }));
    expect(res.status).toBe(400);
  });

  it('retourne 400 si la clé est absente', async () => {
    const res = await POST(makeRequest({ file: validFile }));
    expect(res.status).toBe(400);
  });

  it('retourne 400 pour une traversée de répertoire (..)', async () => {
    const res = await POST(makeRequest({ file: validFile, key: 'songs/../secret.pdf' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Clé invalide');
  });

  it('retourne 400 pour un chemin absolu (/)', async () => {
    const res = await POST(makeRequest({ file: validFile, key: '/songs/secret.pdf' }));
    expect(res.status).toBe(400);
  });

  it('upload le fichier vers R2 et retourne 200', async () => {
    const res = await POST(makeRequest({ file: validFile, key: 'songs/song-1/123.pdf' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('appelle r2.send avec la bonne clé et le bon content-type', async () => {
    await POST(makeRequest({ file: validFile, key: 'songs/song-1/123.pdf' }));
    expect(mockSend).toHaveBeenCalledOnce();
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'songs/song-1/123.pdf',
      ContentType: 'application/pdf',
    });
  });

  it('retourne 500 si R2 échoue', async () => {
    mockSend.mockRejectedValueOnce(new Error('R2 error'));
    await expect(POST(makeRequest({ file: validFile, key: 'songs/song-1/123.pdf' }))).rejects.toThrow();
  });
});
