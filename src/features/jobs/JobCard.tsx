import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Job } from '@/api/types';
import { paths } from '@/routes/paths';
import { formatCurrency, formatRelative } from '@/lib/format';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/** Job card — schema fields only (HLD decision #7: no trust badges / distance). */
export function JobCard({ job }: { job: Job }) {
  const { t } = useTranslation('jobs');

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              <Link to={paths.jobDetail(job.id)} className="no-underline hover:underline">
                {job.title}
              </Link>
            </h3>
            {job.companyName && <p className="text-content-muted">{job.companyName}</p>}
          </div>
          <Badge tone="info">{t(`type.${job.jobType}`)}</Badge>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <dt className="text-content-muted">{t('card.takeHome')}</dt>
            <dd className="font-semibold">
              {formatCurrency(job.netSalary)}
              <span className="font-normal text-content-muted">{t('card.perMonth')}</span>
            </dd>
          </div>
          <div>
            <dt className="text-content-muted">{t('fields.district')}</dt>
            <dd className="font-medium">{job.district}</dd>
          </div>
          {job.tradeRequired && (
            <div>
              <dt className="text-content-muted">{t('fields.trade')}</dt>
              <dd className="font-medium">{job.tradeRequired}</dd>
            </div>
          )}
        </dl>

        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {t('fields.posted')} {formatRelative(job.postedAt)}
          </p>
          <Link to={paths.jobDetail(job.id)} className="text-sm font-medium">
            {t('detail.applyTitle')} →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
