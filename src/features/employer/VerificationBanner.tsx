import { useTranslation } from 'react-i18next';
import type { EmployerProfile } from '@/api/types';
import { cn } from '@/lib/cn';

/** Verification status banner (HLD §6 employer verification workflow). */
export function VerificationBanner({ profile }: { profile: EmployerProfile }) {
  const { t } = useTranslation('employer');

  const styles: Record<EmployerProfile['status'], string> = {
    pending: 'border-warning/40 bg-amber-50 text-warning',
    verified: 'border-success/40 bg-green-50 text-success',
    rejected: 'border-danger/40 bg-red-50 text-danger',
  };

  return (
    <div className={cn('rounded-lg border p-4', styles[profile.status])} role="status">
      <p className="font-semibold">{t(`verification.${profile.status}`)}</p>
      <p className="text-sm text-content">{t(`verification.${profile.status}Body`)}</p>
      {profile.status === 'rejected' && profile.rejectionReason && (
        <p className="mt-1 text-sm text-content">
          {t('verification.rejectedReason', { reason: profile.rejectionReason })}
        </p>
      )}
    </div>
  );
}
