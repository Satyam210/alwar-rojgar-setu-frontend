import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useJob } from '@/features/jobs/queries';
import { useApplyToJob } from '@/features/applications/queries';
import { useAuthStore } from '@/stores/authStore';
import { paths } from '@/routes/paths';
import { formatCurrency, formatNumber, formatRelative } from '@/lib/format';
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
    apply.mutate(jobId as string, {
      onSuccess: () => toast.success(t('jobs:detail.applySuccess')),
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
                  <p className="mt-1 text-content-muted">{job.companyName}</p>
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
              <Detail label={t('jobs:fields.netSalary')} value={formatCurrency(job.netSalary)} />
              <Detail label={t('jobs:fields.grossSalary')} value={formatCurrency(job.grossSalary)} />
              <Detail label={t('jobs:fields.district')} value={job.district} />
              {job.tradeRequired && (
                <Detail label={t('jobs:fields.trade')} value={job.tradeRequired} />
              )}
              <Detail
                label={t('jobs:fields.openings')}
                value={t('jobs:detail.openings', { count: job.openings })}
              />
              <Detail label={t('jobs:fields.filled')} value={formatNumber(job.filledCount)} />
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
              {formatCurrency(job.netSalary)}
              <span className="text-base font-normal text-content-muted">
                {t('jobs:card.perMonth')}
              </span>
            </p>

            {!isOpen && (
              <p className="rounded bg-amber-50 p-3 text-sm text-warning" role="status">
                {t('jobs:detail.expiredNotice')}
              </p>
            )}

            {user && user.role !== 'candidate' ? (
              <p className="text-sm text-content-muted">{t('jobs:detail.candidatesOnly')}</p>
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
