import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const { t } = useTranslation('common');
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
      aria-label={t('pagination.page')}
    >
      <p className="text-sm text-content-muted" aria-live="polite">
        {t('pagination.showing', { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {t('actions.previous')}
        </Button>
        <span className="px-2 text-sm">
          {t('pagination.page')} {page} {t('pagination.of')} {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {t('actions.next')}
        </Button>
      </div>
    </nav>
  );
}
