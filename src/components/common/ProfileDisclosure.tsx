import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclosureButton } from './DisclosureButton';

/** Self-managed "Show full profile" disclosure — reveals its children when open. */
export function ProfileDisclosure({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  return (
    <div>
      <DisclosureButton
        open={open}
        onClick={() => setOpen((o) => !o)}
        showLabel={t('actions.showFullProfile')}
        hideLabel={t('actions.hideFullProfile')}
      />
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
