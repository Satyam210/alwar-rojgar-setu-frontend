import { api } from './client';

/**
 * GET /documents/:filename — auth-gated file access.
 *
 * Backend stores upload URLs as "/uploads/<filename>". Files cannot be fetched
 * directly at that path — they must go through /api/v1/documents/<filename>
 * with a valid Bearer token. This helper extracts the filename, fetches the
 * blob via axios (so the in-memory token is injected automatically), and
 * returns a temporary object URL for use in <img src> or window.open.
 *
 * Returns null for mock-mode placeholder URLs (no real bytes available).
 * Callers should revoke the returned URL via URL.revokeObjectURL when done.
 */
export async function fetchDocumentBlobUrl(urlPath: string): Promise<string | null> {
  if (!urlPath || urlPath.startsWith('mock://')) return null;
  const filename = urlPath.split('/').pop();
  if (!filename) return null;
  const { data } = await api.get<Blob>(`/documents/${filename}`, { responseType: 'blob' });
  return URL.createObjectURL(data);
}
