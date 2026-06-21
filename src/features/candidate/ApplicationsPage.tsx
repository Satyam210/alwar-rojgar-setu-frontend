import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCandidateApplications } from '@/features/applications/queries';
import { paths } from '@/routes/paths';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { ApplicationStatus } from '@/api/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ApplicationStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';

const STATUSES: ApplicationStatus[] = ['received', 'viewed', 'shortlisted', 'rejected', 'hired'];

export function CandidateApplicationsPage() {
  const { t } = useTranslation(['applications', 'common']);
  usePageTitle(t('applications:candidate.title'));
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useCandidateApplications({
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1>{t('applications:candidate.title')}</h1>
        <div className="w-56">
          <Field label={t('applications:candidate.filterByStatus')}>
            <NativeSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ApplicationStatus | '');
                setPage(1);
              }}
            >
              <option value="">{t('applications:candidate.allStatuses')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`applications:status.${s}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && data.data.length === 0 && (
        <EmptyState
          title={t('applications:candidate.empty')}
          body={t('applications:candidate.emptyBody')}
          action={
            <Button asChild>
              <Link to={paths.jobs}>{t('common:nav.findJobs')}</Link>
            </Button>
          }
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.data.map((app) => (
              <li key={app.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold">
                        {app.job ? (
                          <Link to={paths.jobDetail(app.job.id)} className="no-underline hover:underline">
                            {app.job.title}
                          </Link>
                        ) : (
                          t('applications:candidate.title')
                        )}
                      </h2>
                      {app.job?.companyName && (
                        <p className="text-sm text-content-muted">{app.job.companyName}</p>
                      )}
                      <p className="text-sm text-content-muted">
                        {t('applications:candidate.appliedOn', { date: formatDate(app.createdAt) })}
                      </p>
                    </div>
                    <div className="text-right">
                      <ApplicationStatusBadge status={app.status} />
                      <p className="mt-1 max-w-xs text-sm text-content-muted">
                        {t(`applications:statusHelp.${app.status}`)}
                      </p>
                    </div>
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
    </div>
  );
}
