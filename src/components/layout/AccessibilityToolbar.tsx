import { useTranslation } from 'react-i18next';
import { useA11yStore } from '@/stores/a11yStore';
import { cn } from '@/lib/cn';

/**
 * GIGW accessibility toolbar (HLD §10): font resize (A- / A / A+) and a
 * high-contrast toggle. State persists in localStorage and applies to <html>.
 */
export function AccessibilityToolbar() {
  const { t } = useTranslation('common');
  const { decreaseFont, resetFont, increaseFont, toggleHighContrast, highContrast } =
    useA11yStore();

  const btn =
    'rounded border border-border bg-surface px-2 py-1 text-sm font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600';

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('a11y.toolbar')}>
      <button type="button" className={btn} onClick={decreaseFont} aria-label={t('a11y.decreaseFont')}>
        A−
      </button>
      <button type="button" className={btn} onClick={resetFont} aria-label={t('a11y.resetFont')}>
        A
      </button>
      <button
        type="button"
        className={btn}
        onClick={increaseFont}
        aria-label={t('a11y.increaseFont')}
      >
        A+
      </button>
      <button
        type="button"
        className={cn(btn, highContrast && 'bg-content text-surface')}
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
        aria-label={t('a11y.highContrast')}
        title={t('a11y.highContrast')}
      >
        ◐
      </button>
    </div>
  );
}
