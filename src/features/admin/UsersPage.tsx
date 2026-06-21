import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminCandidates, useAdminEmployers, useToggleUser } from './queries';
import { PAGE_SIZE } from '@/lib/constants';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { cn } from '@/lib/cn';
import { toast } from '@/components/ui/toast';

interface UserRow {
  id: string;
  userId: string;
  name: string;
  subtitle?: string;
  isActive?: boolean;
}

export function AdminUsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:users.title'));
  const [tab, setTab] = useState('candidates');

  const tabClass = (active: boolean) =>
    cn(
      'rounded px-4 py-2 font-medium focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600',
      active ? 'bg-brand-700 text-white' : 'bg-surface text-content hover:bg-surface-muted',
    );

  return (
    <div className="flex flex-col gap-6">
      <h1>{t('admin:users.title')}</h1>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="mb-4 flex gap-2" aria-label={t('admin:users.title')}>
          <Tabs.Trigger value="candidates" className={tabClass(tab === 'candidates')}>
            {t('admin:candidates.title')}
          </Tabs.Trigger>
          <Tabs.Trigger value="employers" className={tabClass(tab === 'employers')}>
            {t('admin:employers.title')}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="candidates">
          <CandidatesTab />
        </Tabs.Content>
        <Tabs.Content value="employers">
          <EmployersTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function CandidatesTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminCandidates({ page, limit: PAGE_SIZE });
  const rows: UserRow[] =
    data?.data.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.fullName,
      subtitle: [c.itiTrade, c.district].filter(Boolean).join(' · '),
      isActive: c.isActive,
    })) ?? [];
  return (
    <UserList
      rows={rows}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      page={data?.page ?? 1}
      totalPages={data?.totalPages ?? 1}
      total={data?.total ?? 0}
      limit={data?.limit ?? PAGE_SIZE}
      onPageChange={setPage}
    />
  );
}

function EmployersTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminEmployers({ page, limit: PAGE_SIZE });
  const rows: UserRow[] =
    data?.data.map((e) => ({
      id: e.id,
      userId: e.userId,
      name: e.companyName,
      subtitle: e.gstNumber ?? undefined,
      isActive: e.isActive,
    })) ?? [];
  return (
    <UserList
      rows={rows}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      page={data?.page ?? 1}
      totalPages={data?.totalPages ?? 1}
      total={data?.total ?? 0}
      limit={data?.limit ?? PAGE_SIZE}
      onPageChange={setPage}
    />
  );
}

function UserList({
  rows,
  isLoading,
  isError,
  onRetry,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  rows: UserRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const { t } = useTranslation('admin');
  const toggle = useToggleUser();

  function handleToggle(row: UserRow, enable: boolean) {
    const msg = enable ? t('users.enableConfirm') : t('users.disableConfirm');
    if (!confirm(msg)) return;
    toggle.mutate(
      { userId: row.userId, enable },
      {
        onSuccess: () => toast.success(enable ? t('users.enabled') : t('users.disabled')),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (rows.length === 0) return <EmptyState />;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const active = row.isActive !== false;
          return (
            <li key={row.id}>
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">{row.name}</h2>
                      <Badge tone={active ? 'success' : 'danger'} icon={active ? '✓' : '✕'}>
                        {active ? t('users.active') : t('users.inactive')}
                      </Badge>
                    </div>
                    {row.subtitle && <p className="text-sm text-content-muted">{row.subtitle}</p>}
                  </div>
                  {active ? (
                    <Button variant="danger" size="sm" onClick={() => handleToggle(row, false)}>
                      {t('users.disable')}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleToggle(row, true)}>
                      {t('users.enable')}
                    </Button>
                  )}
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </>
  );
}
