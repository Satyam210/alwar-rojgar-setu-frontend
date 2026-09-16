import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAdminEmployers, useToggleUser, useVerifyEmployer } from './queries';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { downloadCsv, stampedFilename, type CsvColumn } from '@/lib/export';
import type { EmployerProfile, EmployerStatus } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { AuthedCompanyLogo } from '@/components/ui/CompanyLogo';
import { EmployerStatusBadge } from '@/components/common/StatusBadge';
import { EmployerProfileDetails } from '@/components/common/EmployerProfileDetails';
import { DisclosureButton } from '@/components/common/DisclosureButton';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

const STATUSES: EmployerStatus[] = ['pending', 'verified', 'rejected'];

export function AdminEmployersPage() {
  const { t } = useTranslation(['admin', 'employer', 'common']);
  usePageTitle(t('admin:employers.title'));
  const isSuperAdmin = useAuthStore((s) => s.user?.adminRole === 'super_admin');

  // Fetch the full list once; all filtering/paging happens on the client.
  const { data, isLoading, isError, refetch } = useAdminEmployers({ limit: 500 });

  const [status, setStatus] = useState<EmployerStatus | ''>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const verify = useVerifyEmployer();
  const toggle = useToggleUser();
  const [rejecting, setRejecting] = useState<EmployerProfile | null>(null);
  const [reason, setReason] = useState('');

  const all = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((e) => {
      if (status && e.status !== status) return false;
      if (term && !e.companyName.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [all, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  function handleExport() {
    const columns: CsvColumn<EmployerProfile>[] = [
      { header: 'Company Name', value: (e) => e.companyName },
      { header: 'Contact Person', value: (e) => e.contactPersonName },
      { header: 'Contact Phone', value: (e) => e.contactPersonPhone },
      { header: 'Contact Email', value: (e) => e.contactPersonEmail },
      { header: 'Designation', value: (e) => e.contactPersonDesignation },
      { header: 'Status', value: (e) => e.status },
      { header: 'Active', value: (e) => (e.isActive === false ? 'No' : 'Yes') },
      { header: 'GST Number', value: (e) => e.gstNumber },
      { header: 'Udyam Number', value: (e) => e.udyamNumber },
      { header: 'Description', value: (e) => e.description },
      { header: 'Rejection Reason', value: (e) => e.rejectionReason },
      { header: 'Registered On', value: (e) => formatDate(e.createdAt) },
    ];
    downloadCsv(stampedFilename('employers'), filtered, columns);
  }

  async function approve(emp: EmployerProfile) {
    const ok = await confirmDialog({
      title: t('admin:employers.verify'),
      body: t('admin:employers.verifyConfirm'),
      confirmLabel: t('admin:employers.verify'),
    });
    if (!ok) return;
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

  async function toggleActive(emp: EmployerProfile) {
    const enable = emp.isActive === false;
    const ok = await confirmDialog({
      title: enable ? t('admin:employers.enable') : t('admin:employers.disable'),
      body: enable ? t('admin:employers.enableConfirm') : t('admin:employers.disableConfirm'),
      confirmLabel: enable ? t('admin:employers.enable') : t('admin:employers.disable'),
      destructive: !enable,
    });
    if (!ok) return;
    toggle.mutate(
      { userId: emp.userId, enable },
      {
        onSuccess: () =>
          toast.success(enable ? t('admin:employers.enabled') : t('admin:employers.disabled')),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>{t('admin:employers.title')}</h1>
        <Button variant="secondary" onClick={handleExport} disabled={filtered.length === 0}>
          {t('admin:employers.download')}
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Field label={t('admin:employers.search')}>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
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
                resetPage();
              }}
            >
              <option value="">{t('admin:employers.allStatuses')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`employer:verification.${s}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        {(status || search) && (
          <Button
            variant="secondary"
            onClick={() => {
              setStatus('');
              setSearch('');
              resetPage();
            }}
          >
            {t('common:actions.clear')}
          </Button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && filtered.length === 0 && <EmptyState title={t('admin:employers.empty')} />}

      {data && filtered.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {pageItems.map((emp) => (
              <li key={emp.id}>
                <AdminEmployerCard
                  employer={emp}
                  isSuperAdmin={isSuperAdmin}
                  onApprove={approve}
                  onReject={setRejecting}
                  onToggleActive={toggleActive}
                />
              </li>
            ))}
          </ul>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
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

interface AdminEmployerCardProps {
  employer: EmployerProfile;
  isSuperAdmin: boolean;
  onApprove: (emp: EmployerProfile) => void;
  onReject: (emp: EmployerProfile) => void;
  onToggleActive: (emp: EmployerProfile) => void;
}

function AdminEmployerCard({
  employer: emp,
  isSuperAdmin,
  onApprove,
  onReject,
  onToggleActive,
}: AdminEmployerCardProps) {
  const { t } = useTranslation(['admin', 'employer', 'common']);
  const [open, setOpen] = useState(false);
  const active = emp.isActive !== false;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <AuthedCompanyLogo name={emp.companyName} logoUrl={emp.logoUrl} />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{emp.companyName}</h2>
                <EmployerStatusBadge status={emp.status} />
                {!active && (
                  <Badge tone="danger" icon="✕">
                    {t('admin:employers.inactive')}
                  </Badge>
                )}
              </div>
              <p className="max-w-prose text-sm text-content">
                {emp.description?.trim() || (
                  <span className="italic text-content-muted">
                    {t('admin:employers.noDescription')}
                  </span>
                )}
              </p>
              {emp.contactPersonName && (
                <p className="text-sm text-content">
                  {t('employer:fields.contactPerson')}: {emp.contactPersonName}
                  {emp.contactPersonDesignation ? ` (${emp.contactPersonDesignation})` : ''}
                </p>
              )}
              {emp.rejectionReason && emp.status === 'rejected' && (
                <p className="text-sm text-danger">
                  {t('admin:employers.rejectReason')}: {emp.rejectionReason}
                </p>
              )}
              <p className="text-xs text-content-muted">{formatDate(emp.createdAt)}</p>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
              {emp.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onApprove(emp)}>
                    {t('admin:employers.verify')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onReject(emp)}>
                    {t('admin:employers.reject')}
                  </Button>
                </div>
              )}
              {emp.status === 'verified' && (
                <Button
                  variant={active ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => onToggleActive(emp)}
                >
                  {active ? t('admin:employers.disable') : t('admin:employers.enable')}
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <DisclosureButton
            open={open}
            onClick={() => setOpen((o) => !o)}
            showLabel={t('common:actions.showFullProfile')}
            hideLabel={t('common:actions.hideFullProfile')}
          />
          {open && (
            <div className="mt-4">
              <EmployerProfileDetails employer={emp} />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
