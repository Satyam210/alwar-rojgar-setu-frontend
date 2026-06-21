import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

/**
 * Loading / empty / error states for every list (HLD §10 — progressive
 * rendering, not blocking spinners). Each is a small, reusable block.
 */

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation('common');
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-content-muted" role="status">
      <Spinner className="h-5 w-5" />
      <span>{label ?? t('states.loading')}</span>
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
      <p className="text-lg font-semibold">{t('states.errorTitle')}</p>
      <p className="max-w-md text-content-muted">{message ?? t('states.errorBody')}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('actions.retry')}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title?: string;
  body?: string;
  action?: React.ReactNode;
}) {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface py-12 text-center">
      <p className="text-lg font-semibold">{title ?? t('states.emptyTitle')}</p>
      {body && <p className="max-w-md text-content-muted">{body}</p>}
      {action}
    </div>
  );
}
