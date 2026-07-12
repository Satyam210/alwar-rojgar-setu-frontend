import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminAdmins, useReviewAdmin } from './queries';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { AdminStatus, AdminUser } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

const STATUSES: AdminStatus[] = ['pending', 'approved', 'rejected'];

const STATUS_TONE: Record<AdminStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

/** Legacy/seeded admins may have a null admin_status; treat them as approved. */
function normalizeStatus(status: AdminStatus | null): AdminStatus {
  return status ?? 'approved';
}

export function AdminUsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:users.title'));

  // Default to the queue admins act on: pending access requests.
  const [status, setStatus] = useState<AdminStatus | ''>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminAdmins({
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const review = useReviewAdmin();

  async function handleReview(row: AdminUser, approve: boolean) {
    const ok = await confirmDialog({
      title: approve ? t('admin:users.approve') : t('admin:users.reject'),
      body: approve ? t('admin:users.approveConfirm') : t('admin:users.rejectConfirm'),
      confirmLabel: approve ? t('admin:users.approve') : t('admin:users.reject'),
      destructive: !approve,
    });
    if (!ok) return;
    review.mutate(
      { userId: row.userId, approve },
      {
        onSuccess: () =>
          toast.success(approve ? t('admin:users.approved') : t('admin:users.rejected')),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>{t('admin:users.title')}</h1>
        <p className="text-content-muted">{t('admin:users.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Field label={t('admin:users.filterStatus')}>
            <NativeSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AdminStatus | '');
                setPage(1);
              }}
            >
              <option value="">{t('admin:users.allStatuses')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`admin:users.status.${s}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        {status && (
          <Button
            variant="secondary"
            onClick={() => {
              setStatus('');
              setPage(1);
            }}
          >
            {t('common:actions.clear')}
          </Button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && rows.length === 0 && <EmptyState title={t('admin:users.empty')} />}

      {data && rows.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const st = normalizeStatus(row.adminStatus);
              return (
              <li key={row.userId}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">{row.name || row.email}</h2>
                        <Badge tone={STATUS_TONE[st]}>
                          {t(`admin:users.status.${st}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-content-muted">
                        {row.email}
                      </p>
                      {row.createdAt && (
                        <p className="text-xs text-content-muted">
                          {t('admin:users.requestedOn')} {formatDate(row.createdAt)}
                        </p>
                      )}
                    </div>
                    {st === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReview(row, true)}>
                          {t('admin:users.approve')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReview(row, false)}>
                          {t('admin:users.reject')}
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </li>
              );
            })}
          </ul>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
