import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  hasChosenLanguage,
  LANG_KEY,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
} from '@/i18n';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

/**
 * First-visit language prompt. Shown once, before the user has explicitly
 * chosen a language. The pick is persisted (i18next localStorage detector), so
 * the prompt never reappears. Dismissing keeps the current default.
 */
export function LanguageGate() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasChosenLanguage()) setOpen(true);
  }, []);

  function persist(lng: AppLanguage) {
    try {
      localStorage.setItem(LANG_KEY, lng);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }

  function choose(lng: AppLanguage) {
    changeLanguage(lng);
    persist(lng);
    setOpen(false);
  }

  function onOpenChange(next: boolean) {
    if (!next) {
      // Dismissed without an explicit pick — lock in the current language.
      persist((SUPPORTED_LANGUAGES.includes('en') ? 'en' : SUPPORTED_LANGUAGES[0]) as AppLanguage);
      setOpen(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('languagePicker.title')}
      description={t('languagePicker.subtitle')}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <Button key={lng} size="lg" variant="secondary" lang={lng} onClick={() => choose(lng)}>
            {t(`language.${lng}`)}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
