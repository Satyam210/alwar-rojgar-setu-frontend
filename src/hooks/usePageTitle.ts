import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Keep document.title in sync per route (helps screen-reader orientation). */
export function usePageTitle(title: string): void {
  const { t } = useTranslation('common');
  useEffect(() => {
    const appName = t('app.name');
    document.title = title ? `${title} · ${appName}` : appName;
  }, [title, t]);
}
