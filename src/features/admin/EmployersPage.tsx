import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminEmployers, useVerifyEmployer } from './queries';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { EmployerProfile, EmployerStatus } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmployerStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

const STATUSES: EmployerStatus[] = ['pending', 'verified', 'rejected'];

export function AdminEmployersPage() {
  const { t } = useTranslation(['admin', 'employer', 'common']);
  usePageTitle(t('admin:employers.title'));

  const [status, setStatus] = useState<EmployerStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminEmployers({
    status: status || undefined,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const verify = useVerifyEmployer();
  const [rejecting, setRejecting] = useState<EmployerProfile | null>(null);
  const [reason, setReason] = useState('');

  function approve(emp: EmployerProfile) {
    if (!confirm(t('admin:employers.verifyConfirm'))) return;
    verify.mutate(
      { id: emp.id, payload: { status: 'verified' } },
      {
        onSuccess: () => toast.success(t('admin:employers.verified')),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  function reject() {
    if (!rejecting) return;
    verify.mutate(
      { id: rejecting.id, payload: { status: 'rejected', reason } },
      {
        onSuccess: () => {
          toast.success(t('admin:employers.rejected'));
          setRejecting(null);
          setReason('');
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1>{t('admin:employers.title')}</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Field label={t('admin:employers.search')}>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <div className="w-48">
          <Field label={t('admin:employers.filterStatus')}>
            <NativeSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as EmployerStatus | '');
                setPage(1);
              }}
            >
              <option value="">{t('common:actions.filter')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`employer:verification.${s}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && data.data.length === 0 && <EmptyState title={t('admin:employers.empty')} />}

      {data && data.data.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.data.map((emp) => (
              <li key={emp.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold">{emp.companyName}</h2>
                        <EmployerStatusBadge status={emp.status} />
                      </div>
                      <p className="text-sm text-content-muted">
                        {[emp.gstNumber, emp.udyamNumber].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <p className="text-sm text-content-muted">{formatDate(emp.createdAt)}</p>
                    </div>
                    {emp.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approve(emp)}>
                          {t('admin:employers.verify')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRejecting(emp)}>
                          {t('admin:employers.reject')}
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </li>
            ))}
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

      <Modal
        open={Boolean(rejecting)}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={t('admin:employers.rejectTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button variant="danger" loading={verify.isPending} onClick={reject}>
              {t('admin:employers.reject')}
            </Button>
          </>
        }
      >
        <Field label={t('admin:employers.rejectReason')} required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
