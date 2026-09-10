import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useJob } from '@/features/jobs/queries';
import { useApplyToJob, useCandidateApplications } from '@/features/applications/queries';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { paths } from '@/routes/paths';
import { formatCurrency, formatRelative } from '@/lib/format';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { JobStatusBadge } from '@/components/common/StatusBadge';
import { ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function JobDetailPage() {
  const { t } = useTranslation(['jobs', 'common']);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: job, isLoading, isError, refetch } = useJob(jobId);
  const apply = useApplyToJob();
  const [justApplied, setJustApplied] = useState(false);

  const isCandidate = user?.role === 'candidate';
  const { data: myApplications } = useCandidateApplications(
    { limit: 100 },
    { enabled: isCandidate },
  );
  const hasApplied =
    justApplied || !!myApplications?.data.some((a) => a.jobId === jobId);

  usePageTitle(job?.title ?? t('jobs:search.title'));

  if (isLoading) return <LoadingState />;
  if (isError || !job) return <ErrorState onRetry={refetch} />;

  const isOpen = job.status === 'active';
  const canApply = isOpen && (!user || user.role === 'candidate');

  function handleApply() {
    if (!user) {
      navigate(paths.login, { state: { from: paths.jobDetail(jobId) } });
      return;
    }
    // Block application until the candidate has completed their profile —
    // route them to the profile page insisting on completion first.
    if (user.role === 'candidate' && !isProfileComplete(user)) {
      toast.error(
        t('jobs:detail.completeProfileFirst', {
          defaultValue: 'Please complete your profile before applying to jobs.',
        }),
      );
      navigate(paths.candidate.onboarding);
      return;
    }
    apply.mutate(jobId as string, {
      onSuccess: () => {
        setJustApplied(true);
        toast.success(t('jobs:detail.applySuccess'));
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <article>
        <Link to={paths.jobs} className="text-sm">
          ← {t('common:actions.back')}
        </Link>
        <Card className="mt-3">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1>{job.title}</h1>
                {job.companyName && (
                  <Link
                    to={`${paths.jobs}?companyName=${encodeURIComponent(job.companyName)}`}
                    className="mt-1 inline-block font-medium text-brand-700 hover:underline"
                  >
                    {job.companyName}
                  </Link>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <JobStatusBadge status={job.status} />
                <Badge tone="info">{t(`jobs:type.${job.jobType}`)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Detail
                label={t('jobs:fields.salary')}
                value={formatCurrency(job.grossSalary)}
              />
              <Detail label={t('jobs:fields.district')} value={job.district} />
              {job.tradeRequired && (
                <Detail label={t('jobs:fields.trade')} value={job.tradeRequired} />
              )}
              <Detail
                label={t('jobs:fields.openings')}
                value={t('jobs:detail.openings', { count: job.openings })}
              />
              <Detail
                label={t('jobs:fields.remaining')}
                value={
                  job.openings - job.filledCount > 0
                    ? t('jobs:detail.remaining', { count: job.openings - job.filledCount })
                    : t('jobs:detail.allFilled')
                }
              />
            </dl>

            <div>
              <h2 className="mb-2">{t('jobs:detail.aboutRole')}</h2>
              <p className="whitespace-pre-line text-content">{job.description}</p>
            </div>

            <p className="text-sm text-content-muted">
              {t('jobs:fields.posted')} {formatRelative(job.postedAt)}
            </p>
          </CardBody>
        </Card>
      </article>

      <aside>
        <Card className="lg:sticky lg:top-4">
          <CardBody className="flex flex-col gap-3">
            <h2 className="text-lg">{t('jobs:detail.applyTitle')}</h2>
            <p className="text-2xl font-bold text-brand-800">
              {formatCurrency(job.grossSalary)}
              <span className="text-base font-normal text-content-muted">
                {t('jobs:card.perMonth')}
              </span>
            </p>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-content-muted">
                <span>{t('jobs:detail.filledProgress', { filled: job.filledCount, total: job.openings })}</span>
                <span className="font-medium text-content">
                  {job.openings - job.filledCount > 0
                    ? t('jobs:detail.remaining', { count: job.openings - job.filledCount })
                    : t('jobs:detail.allFilled')}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted" role="presentation">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{
                    width: `${job.openings > 0 ? Math.min(100, (job.filledCount / job.openings) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {!isOpen && (
              <p className="rounded bg-amber-50 p-3 text-sm text-warning" role="status">
                {t('jobs:detail.expiredNotice')}
              </p>
            )}

            {user && user.role !== 'candidate' ? (
              <p className="text-sm text-content-muted">{t('jobs:detail.candidatesOnly')}</p>
            ) : hasApplied ? (
              <div
                role="status"
                className="flex w-full items-center justify-center gap-2 rounded border border-success/40 bg-success/10 px-6 py-3 text-lg font-semibold text-success"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('jobs:detail.appliedCta')}
              </div>
            ) : (
              <Button block size="lg" onClick={handleApply} loading={apply.isPending} disabled={!canApply}>
                {user ? t('jobs:detail.applyCta') : t('jobs:detail.loginToApply')}
              </Button>
            )}
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-content-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
