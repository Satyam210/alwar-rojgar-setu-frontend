import i18n, { changeLanguage, type AppLanguage } from '@/i18n';
import { translatePage, clearPageTranslateState, getActivePageLang } from '@/lib/pageTranslate';

/**
 * Unified language switch: the single UI control (LanguageToggle) drives both
 * translation layers.
 *
 * 1. i18next flips the curated, bundled UI strings *instantly* — the always
 *    available baseline / offline fallback.
 * 2. For non-source languages we then layer the backend page-translation
 *    (`POST /api/v1/translate`) on top, in the background, so dynamic DB content
 *    (job titles, company names, descriptions, …) is translated too. The static
 *    text stays visible while that request is in flight and remains as the
 *    fallback if the backend is slow or unreachable (e.g. static/demo mode).
 *
 * English is the app's source language, so switching to it just restores the
 * original DOM — no backend call.
 *
 * TEMPORARY layering note: this pairs the static i18n toggle with the backend
 * proxy while the API stabilises. If the backend translation is ever dropped,
 * delete the `translatePage` / `restoreOriginal` calls here and the toggle falls
 * back to pure static i18n.
 */
export function setAppLanguage(lng: AppLanguage): void {
  changeLanguage(lng);

  if (lng === 'en') {
    clearPageTranslateState();
    return;
  }

  void translatePage(lng);
}

/**
 * Re-apply backend page-translation on app load when the persisted UI language
 * is not the source language, so a refresh keeps dynamic content translated.
 */
export function bootstrapPageTranslation(): void {
  const lng = i18n.resolvedLanguage;
  if (lng && lng !== 'en' && !getActivePageLang()) {
    void translatePage(lng);
  }
}
