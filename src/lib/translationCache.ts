/**
 * Client-side translation cache — the browser-tier companion to the backend's
 * Postgres cache. Avoids re-hitting the backend proxy (and the free upstream
 * provider) for strings this device has already translated, so repeat visits
 * and language switches are instant and offline-tolerant.
 *
 * Two tiers:
 *   1. In-memory `Map` — fast lookups within a session.
 *   2. `localStorage` — survives reloads; loaded once on init, written back
 *      debounced so rapid updates don't thrash storage.
 *
 * The cache is bounded (insertion-order eviction) so it can't grow without
 * limit. Only public/UI text passes through here; no auth tokens or secrets.
 */

const STORAGE_KEY = 'ars.translationCache.v1';
const MAX_ENTRIES = 5000;
const PERSIST_DEBOUNCE_MS = 800;

/** Compose a stable cache key from target language + source text. */
function keyFor(target: string, source: string): string {
  // \u241F (SYMBOL FOR UNIT SEPARATOR) can't appear in normal text, so it makes
  // an unambiguous delimiter between the language code and the source string.
  return `${target}\u241F${source}`;
}

/** Lazily-initialised in-memory store (insertion order = eviction order). */
let store: Map<string, string> | null = null;

function load(): Map<string, string> {
  if (store) return store;
  store = new Map<string, string>();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (
            Array.isArray(entry) &&
            typeof entry[0] === 'string' &&
            typeof entry[1] === 'string'
          ) {
            store.set(entry[0], entry[1]);
          }
        }
      }
    }
  } catch {
    // Corrupt/unavailable storage — start empty rather than crashing the app.
    store = new Map<string, string>();
  }
  return store;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const current = store;
    if (!current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current.entries()]));
    } catch {
      // Quota exceeded / storage disabled — cache stays in-memory only.
    }
  }, PERSIST_DEBOUNCE_MS);
}

/** Drop oldest entries until the store is within the size budget. */
function evict(map: Map<string, string>): void {
  while (map.size > MAX_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

/**
 * Split `texts` into cache hits (already-known translations) and misses (must
 * be fetched from the backend). Order within `misses` follows `texts`.
 */
export function getCachedTranslations(
  texts: string[],
  target: string,
): { hits: Map<string, string>; misses: string[] } {
  const map = load();
  const hits = new Map<string, string>();
  const misses: string[] = [];
  const seenMiss = new Set<string>();

  for (const text of texts) {
    const cached = map.get(keyFor(target, text));
    if (cached !== undefined) {
      hits.set(text, cached);
    } else if (!seenMiss.has(text)) {
      seenMiss.add(text);
      misses.push(text);
    }
  }
  return { hits, misses };
}

/** Persist freshly translated `source → translated` pairs for a target lang. */
export function setCachedTranslations(
  target: string,
  entries: Record<string, string>,
): void {
  const map = load();
  for (const [source, translated] of Object.entries(entries)) {
    const key = keyFor(target, source);
    // Re-inserting refreshes recency (delete first so it moves to the tail).
    map.delete(key);
    map.set(key, translated);
  }
  evict(map);
  schedulePersist();
}
