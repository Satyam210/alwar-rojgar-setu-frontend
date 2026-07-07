import { useEffect, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  translatePage,
  restoreOriginal,
  getActivePageLang,
  getPersistedPageLang,
} from '@/lib/pageTranslate';
import { cn } from '@/lib/cn';

/**
 * "Translate this page" widget — modelled on the cleanalwar.in behaviour. Sends
 * the visible page text to the backend translation proxy and swaps it in place.
 * Independent of the i18next UI toggle; useful for full-page + dynamic content.
 *
 * Marked `data-no-translate` so the DOM walker never translates its own labels.
 */

const OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
] as const;

export function PageTranslateWidget() {
  const [active, setActive] = useState<string | null>(getActivePageLang());
  const [busy, setBusy] = useState(false);

  // Re-apply a previously chosen page language after a reload.
  useEffect(() => {
    const persisted = getPersistedPageLang();
    if (persisted && !getActivePageLang()) {
      setActive(persisted);
      setBusy(true);
      void translatePage(persisted).finally(() => setBusy(false));
    }
  }, []);

  async function handleSelect(code: string) {
    setActive(code);
    setBusy(true);
    try {
      await translatePage(code);
    } finally {
      setBusy(false);
    }
  }

  const currentLabel = OPTIONS.find((o) => o.code === active)?.label;

  return (
    <div data-no-translate className="inline-flex">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Translate this page"
            aria-busy={busy}
            className={cn(
              'inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-sm font-medium',
              'bg-surface text-content hover:bg-surface-muted',
              'focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600',
            )}
          >
            <span aria-hidden="true">🌐</span>
            <span>{busy ? '…' : (currentLabel ?? 'Translate')}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-40 rounded-lg border border-border bg-surface p-1 shadow-lg"
          >
            {OPTIONS.map((opt) => (
              <DropdownMenu.Item
                key={opt.code}
                onSelect={() => void handleSelect(opt.code)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm outline-none',
                  'hover:bg-surface-muted focus:bg-surface-muted',
                  active === opt.code && 'font-semibold text-brand-800',
                )}
              >
                <span lang={opt.code}>{opt.label}</span>
                {active === opt.code && <span aria-hidden="true">✓</span>}
              </DropdownMenu.Item>
            ))}
            {active && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={() => restoreOriginal()}
                  className="cursor-pointer rounded px-3 py-2 text-sm outline-none hover:bg-surface-muted focus:bg-surface-muted"
                >
                  Show original
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
