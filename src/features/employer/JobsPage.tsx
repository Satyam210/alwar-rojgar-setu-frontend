import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCloseJob, useCreateJob, useOwnedJobs, useUpdateJob } from '@/features/jobs/queries';
import { useEmployerProfile } from './queries';
import { JobFormModal } from './JobFormModal';
import { paths } from '@/routes/paths';
import { formatCurrency, formatRelative } from '@/lib/format';
import type { Job, JobInput } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JobStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function EmployerJobsPage() {
  const { t } = useTranslation(['employer', 'jobs', 'common']);
  usePageTitle(t('employer:jobs.title'));

  const { data: profile } = useEmployerProfile();
  const { data, isLoading, isError, refetch } = useOwnedJobs();
  const createJob = useCreateJob();
  const closeJob = useCloseJob();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();
  const updateJob = useUpdateJob(editingJob?.id ?? '');

  const isVerified = profile?.status === 'verified';

  function openCreate() {
    setEditingJob(undefined);
    setModalOpen(true);
  }
  function openEdit(job: Job) {
    setEditingJob(job);
    setModalOpen(true);
  }

  function handleSubmit(input: JobInput) {
    const onError = (err: unknown) => toast.error(apiErrorMessage(err));
    if (editingJob) {
      updateJob.mutate(input, {
        onSuccess: () => {
          toast.success(t('employer:jobs.updated'));
          setModalOpen(false);
        },
        onError,
      });
    } else {
      createJob.mutate(input, {
        onSuccess: () => {
          toast.success(t('employer:jobs.created'));
          setModalOpen(false);
        },
        onError,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>{t('employer:jobs.title')}</h1>
        <Button onClick={openCreate} disabled={!isVerified}>
          {t('employer:jobs.post')}
        </Button>
      </div>

      {profile && !isVerified && (
        <p className="rounded border border-warning/40 bg-amber-50 p-3 text-warning" role="status">
          {t('employer:jobs.mustVerify')}
        </p>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && data.data.length === 0 && (
        <EmptyState
          title={t('employer:jobs.empty')}
          body={t('employer:jobs.emptyBody')}
          action={
            isVerified ? <Button onClick={openCreate}>{t('employer:jobs.post')}</Button> : undefined
          }
        />
      )}

      {data && data.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.data.map((job) => (
            <li key={job.id}>
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">{job.title}</h2>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-content-muted">
                      {formatCurrency(job.netSalary)} · {job.district} ·{' '}
                      {t('jobs:fields.posted')} {formatRelative(job.postedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={paths.employer.applicants(job.id)}>
                        {t('employer:jobs.viewApplicants')}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                      {t('common:actions.edit')}
                    </Button>
                    {(job.status === 'active' || job.status === 'draft') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('employer:jobs.closeConfirm'))) {
                            closeJob.mutate(job.id, {
                              onSuccess: () => toast.success(t('employer:jobs.closed')),
                              onError: (err) => toast.error(apiErrorMessage(err)),
                            });
                          }
                        }}
                      >
                        {t('employer:jobs.close')}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <JobFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingJob}
        submitting={createJob.isPending || updateJob.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
