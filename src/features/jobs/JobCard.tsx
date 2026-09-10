import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Job } from '@/api/types';
import { paths } from '@/routes/paths';
import { formatCurrency, formatRelative } from '@/lib/format';
import { Card, CardBody } from '@/components/ui/Card';

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
        </div>

        {job.matchedSkills && job.matchedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-content-muted">
              {t('card.matchedSkills')}
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {job.matchedSkills.map((skill) => (
                <li
                  key={skill}
                  className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <dt className="text-content-muted">{t('card.salary')}</dt>
            <dd className="font-semibold">
              {formatCurrency(job.grossSalary)}
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

        {(() => {
          const remaining = Math.max(0, job.openings - job.filledCount);
          return (
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                remaining > 0 ? 'bg-brand-50 text-brand-800' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {remaining > 0 ? t('card.remaining', { count: remaining }) : t('card.allFilled')}
            </span>
          );
        })()}

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
