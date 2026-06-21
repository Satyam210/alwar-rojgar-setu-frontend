import type { TFunction } from 'i18next';

/**
 * Zod stores i18n keys as messages (validation namespace). This helper resolves
 * them at render time, supporting interpolation params encoded as "key|json".
 */
export function translateError(
  t: TFunction,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined;
  const [key, raw] = message.split('|');
  const params = raw ? safeParse(raw) : undefined;
  return t(key, { ns: 'validation', ...params });
}

function safeParse(raw: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/** Encode a validation key with interpolation params for Zod messages. */
export function vmsg(key: string, params?: Record<string, unknown>): string {
  return params ? `${key}|${JSON.stringify(params)}` : key;
}
