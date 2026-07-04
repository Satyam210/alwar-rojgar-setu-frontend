import { env } from '@/config/env';

/**
 * Client for the backend page-translation proxy (`POST /api/v1/translate`).
 *
 * Uses the native `fetch` API on purpose: the shared axios instance is hijacked
 * by the in-browser mock adapter in dev, but translation always needs the real
 * backend. `fetch` bypasses that layer and talks to the API directly.
 */
export async function requestTranslations(
  texts: string[],
  target: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const res = await fetch(`${env.translateApiBaseUrl}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Translation request failed (${res.status})`);
  }

  const data = (await res.json()) as { translations?: unknown };
  if (!Array.isArray(data.translations)) {
    throw new Error('Malformed translation response');
  }
  return data.translations.map((t) => (typeof t === 'string' ? t : ''));
}
