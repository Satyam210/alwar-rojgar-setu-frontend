import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { formatCurrency } from '@/lib/format';
import { useRecentJobs } from './queries';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState } from '@/components/common/States';
import { JobStatusBadge } from '@/components/common/StatusBadge';

export function FeaturedCompanies() {
  const { t } = useTranslation(['common', 'jobs']);
  const { data, isLoading } = useRecentJobs(6);

  return (
    <section aria-labelledby="featured-heading">
      <div className="mb-5">
        <h2 id="featured-heading">{t('common:home.featured.title')}</h2>
        <p className="text-content-muted">{t('common:home.featured.subtitle')}</p>
      </div>

      {isLoading && <LoadingState />}

      {data && data.data.length === 0 && (
        <p className="text-content-muted">{t('jobs:empty.title')}</p>
      )}

      {data && data.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((job) => (
            <Link
              key={job.id}
              to={paths.jobDetail(job.id)}
              className="no-underline"
              aria-label={`${job.title} at ${job.companyName}`}
            >
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-snug">{job.title}</p>
                      <p className="truncate text-sm text-content-muted">{job.companyName}</p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {job.district}
                    </span>
                    {job.tradeRequired && (
                      <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-content-muted">
                        {job.tradeRequired}
                      </span>
                    )}
                  </div>

                  <p className="mt-auto text-base font-bold text-success">
                    {formatCurrency(job.netSalary)}
                    <span className="ml-1 text-xs font-normal text-content-muted">
                      {t('jobs:card.perMonth')}
                    </span>
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data && data.total > 6 && (
        <div className="mt-5 text-center">
          <Link to={paths.jobs} className="text-sm font-semibold text-brand-700 hover:underline">
            {t('common:home.featured.viewAll')} →
          </Link>
        </div>
      )}
    </section>
  );
}
