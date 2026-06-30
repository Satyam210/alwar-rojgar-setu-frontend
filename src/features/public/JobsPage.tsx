import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useJobSearch } from '@/features/jobs/queries';
import { JobCard } from '@/features/jobs/JobCard';
import { DISTRICTS, ITI_TRADES, JOB_TYPES, PAGE_SIZE } from '@/lib/constants';
import type { JobSearchParams, JobType } from '@/api/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';

export function JobsPage() {
  const { t } = useTranslation(['jobs', 'common']);
  usePageTitle(t('jobs:search.title'));
  const [searchParams, setSearchParams] = useSearchParams();

  const params: JobSearchParams = {
    district: searchParams.get('district') || undefined,
    tradeRequired: searchParams.get('tradeRequired') || undefined,
    jobType: (searchParams.get('jobType') as JobType) || undefined,
    minSalary: numberParam(searchParams.get('minSalary')),
    maxSalary: numberParam(searchParams.get('maxSalary')),
    companyName: searchParams.get('companyName') || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useJobSearch(params);

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside aria-label={t('jobs:filters.title')}>
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="text-lg">{t('jobs:filters.title')}</h2>

            <Field label={t('jobs:filters.district')}>
              <NativeSelect
                value={params.district ?? ''}
                onChange={(e) => setParam('district', e.target.value)}
              >
                <option value="">{t('jobs:filters.anyDistrict')}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label={t('jobs:filters.trade')}>
              <NativeSelect
                value={params.tradeRequired ?? ''}
                onChange={(e) => setParam('tradeRequired', e.target.value)}
              >
                <option value="">{t('jobs:filters.anyTrade')}</option>
                {ITI_TRADES.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label={t('jobs:filters.jobType')}>
              <NativeSelect
                value={params.jobType ?? ''}
                onChange={(e) => setParam('jobType', e.target.value)}
              >
                <option value="">{t('jobs:filters.anyType')}</option>
                {JOB_TYPES.map((jt) => (
                  <option key={jt.value} value={jt.value}>
                    {t(`jobs:type.${jt.value}`)}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('jobs:filters.minSalary')}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={params.minSalary ?? ''}
                  onBlur={(e) => setParam('minSalary', e.target.value)}
                />
              </Field>
              <Field label={t('jobs:filters.maxSalary')}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={params.maxSalary ?? ''}
                  onBlur={(e) => setParam('maxSalary', e.target.value)}
                />
              </Field>
            </div>

            <Button variant="ghost" onClick={clearFilters}>
              {t('common:actions.clear')}
            </Button>
          </CardBody>
        </Card>
      </aside>

      <section aria-label={t('jobs:search.title')}>
        <div className="mb-4 flex items-center justify-between">
          <h1>{t('jobs:search.title')}</h1>
          {data && (
            <p className="text-content-muted" aria-live="polite">
              {t('jobs:search.resultsCount', { count: data.total })}
            </p>
          )}
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState title={t('jobs:search.noResults')} body={t('jobs:search.noResultsBody')} />
        )}

        {data && data.data.length > 0 && (
          <>
            <ul className="flex flex-col gap-4">
              {data.data.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={(p) => setParam('page', String(p))}
            />
          </>
        )}
      </section>
    </div>
  );
}

function numberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
