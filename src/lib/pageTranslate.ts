import { requestTranslations } from '@/api/translate';
import { getCachedTranslations, setCachedTranslations } from '@/lib/translationCache';

/**
 * Whole-page DOM translator — the "translate this page" behaviour modelled on
 * cleanalwar.in. Walks visible text nodes, sends them to the backend proxy, and
 * swaps the text in place. A MutationObserver keeps dynamically rendered /
 * React-re-rendered content translated while a language is active.
 *
 * NOTE: the app's static UI is already bilingual via i18next; this layer covers
 * full-page + dynamic DB content (job titles, descriptions) on top of that.
 */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE']);

// Per-request budgets — kept under the backend's guards (100 texts / 20k chars).
const MAX_TEXTS_PER_CHUNK = 90;
const MAX_CHARS_PER_CHUNK = 18000;
const RETRANSLATE_DEBOUNCE_MS = 400;

/** localStorage key so the chosen page language survives a reload. */
export const PAGE_LANG_KEY = 'ars.pageLang';

let activeTarget: string | null = null;
let observer: MutationObserver | null = null;
let retranslateTimer: ReturnType<typeof setTimeout> | null = null;
let running = false;

// Text nodes we have written, mapped to the value we wrote — lets us ignore our
// own mutations and skip already-translated nodes.
const written = new WeakMap<Text, string>();

function hasTranslatableChars(text: string): boolean {
  // Latin or Devanagari letters — skip pure numbers / punctuation / symbols.
  return /[A-Za-z\u0900-\u097F]/.test(text);
}

/**
 * When switching to Hindi, the curated static i18n strings are already
 * Devanagari. Skip those so the backend only translates the still-English
 * dynamic content — avoids wasted calls and preserves the curated wording.
 */
function isAlreadyInTarget(text: string): boolean {
  if (activeTarget === 'hi') {
    return /[\u0900-\u097F]/.test(text) && !/[A-Za-z]/.test(text);
  }
  return false;
}

function shouldSkip(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.isContentEditable) return true;
  if (parent.closest('[data-no-translate]')) return true;

  const text = node.nodeValue ?? '';
  if (text.trim().length === 0) return true;
  if (!hasTranslatableChars(text)) return true;
  if (written.get(node) === text) return true; // already translated, unchanged
  if (isAlreadyInTarget(text)) return true; // curated static i18n already in target

  return false;
}

function collectNodes(): Text[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    if (!shouldSkip(textNode)) nodes.push(textNode);
    current = walker.nextNode();
  }
  return nodes;
}

function chunkTexts(texts: string[]): string[][] {
  const chunks: string[][] = [];
  let chunk: string[] = [];
  let chars = 0;
  for (const text of texts) {
    if (
      chunk.length > 0 &&
      (chunk.length >= MAX_TEXTS_PER_CHUNK || chars + text.length > MAX_CHARS_PER_CHUNK)
    ) {
      chunks.push(chunk);
      chunk = [];
      chars = 0;
    }
    chunk.push(text);
    chars += text.length;
  }
  if (chunk.length > 0) chunks.push(chunk);
  return chunks;
}

async function translateNodes(target: string, nodes: Text[]): Promise<void> {
  if (nodes.length === 0) return;

  // Group nodes by their trimmed text so identical strings are translated once.
  const byText = new Map<string, Text[]>();
  for (const node of nodes) {
    const key = (node.nodeValue ?? '').trim();
    const list = byText.get(key);
    if (list) list.push(node);
    else byText.set(key, [node]);
  }

  const uniqueTexts = [...byText.keys()];
  const translations = new Map<string, string>();

  // Client-cache first: known strings resolve instantly with no network call;
  // only the misses are sent to the backend proxy.
  const { hits, misses } = getCachedTranslations(uniqueTexts, target);
  for (const [src, val] of hits) translations.set(src, val);

  for (const chunk of chunkTexts(misses)) {
    const out = await requestTranslations(chunk, target);
    const fresh: Record<string, string> = {};
    chunk.forEach((src, i) => {
      const val = out[i] ?? src;
      translations.set(src, val);
      fresh[src] = val;
    });
    // Persist this batch so future loads/switches skip the backend entirely.
    setCachedTranslations(target, fresh);
  }

  // Apply with the observer paused so our writes don't re-trigger a pass.
  observer?.disconnect();
  for (const [src, nodesForText] of byText) {
    const translated = translations.get(src);
    if (translated == null || translated === src) continue;
    for (const node of nodesForText) {
      const raw = node.nodeValue ?? '';
      const lead = raw.match(/^\s*/)?.[0] ?? '';
      const trail = raw.match(/\s*$/)?.[0] ?? '';
      const value = lead + translated + trail;
      node.nodeValue = value;
      written.set(node, value);
    }
  }
  reconnectObserver();
}

function reconnectObserver(): void {
  if (!activeTarget) return;
  if (!observer) {
    observer = new MutationObserver(scheduleRetranslate);
  }
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function scheduleRetranslate(): void {
  if (!activeTarget) return;
  if (retranslateTimer) clearTimeout(retranslateTimer);
  retranslateTimer = setTimeout(() => {
    if (activeTarget) void runPass(activeTarget);
  }, RETRANSLATE_DEBOUNCE_MS);
}

async function runPass(target: string): Promise<void> {
  if (running) return;
  running = true;
  try {
    await translateNodes(target, collectNodes());
  } catch (err) {
    // Non-fatal: leave text untranslated (e.g. backend down / rate-limited).
    console.error('[pageTranslate] pass failed:', err);
  } finally {
    running = false;
  }
}

/** Translate the whole page to `target` and keep it translated as it changes. */
export async function translatePage(target: string): Promise<void> {
  activeTarget = target;
  try {
    localStorage.setItem(PAGE_LANG_KEY, target);
  } catch {
    /* storage unavailable — continue without persistence */
  }
  await runPass(target);
  reconnectObserver();
}

/** The language currently applied to the page, or null when showing original. */
export function getActivePageLang(): string | null {
  return activeTarget;
}

/** Persisted page-language choice from a previous session, if any. */
export function getPersistedPageLang(): string | null {
  try {
    return localStorage.getItem(PAGE_LANG_KEY);
  } catch {
    return null;
  }
}

/** Restore original text by clearing the choice and reloading the page. */
export function restoreOriginal(): void {
  activeTarget = null;
  observer?.disconnect();
  try {
    localStorage.removeItem(PAGE_LANG_KEY);
  } catch {
    /* ignore */
  }
  window.location.reload();
}
