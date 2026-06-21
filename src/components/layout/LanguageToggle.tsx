import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n';
import { cn } from '@/lib/cn';

/**
 * English ⇄ Hindi toggle (HLD §7). Choice is persisted by i18next's
 * localStorage detector and applied to <html lang> on change.
 */
export function LanguageToggle() {
  const { t, i18n } = useTranslation('common');
  const current = (i18n.resolvedLanguage as AppLanguage) ?? 'en';

  return (
    <div
      className="inline-flex items-center rounded border border-border"
      role="group"
      aria-label={t('a11y.selectLanguage')}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => changeLanguage(lng)}
          aria-pressed={current === lng}
          lang={lng}
          className={cn(
            'px-2.5 py-1 text-sm font-medium first:rounded-l last:rounded-r focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600',
            current === lng
              ? 'bg-brand-700 text-white'
              : 'bg-surface text-content hover:bg-surface-muted',
          )}
        >
          {t(`language.${lng}`)}
        </button>
      ))}
    </div>
  );
}
