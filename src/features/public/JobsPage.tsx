import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useJobSearch, useRecommendedJobs } from '@/features/jobs/queries';
import { JobCard } from '@/features/jobs/JobCard';
import { DISTRICTS, ITI_TRADES, PAGE_SIZE } from '@/lib/constants';
import type { JobSearchParams } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';
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
  const isCandidate = useAuthStore((s) => s.user?.role === 'candidate');

  const rawDistrict = searchParams.get('district');
  // Default the location filter to the pilot location (Alwar) on first load, but
  // not when arriving via a company link (so all of that company's jobs show).
  // 'all' is an explicit sentinel for "Any location".
  const districtValue = rawDistrict ?? (searchParams.get('companyName') ? 'all' : 'Alwar');

  const params: JobSearchParams = {
    q: searchParams.get('q') || undefined,
    district: districtValue === 'all' ? undefined : districtValue,
    tradeRequired: searchParams.get('tradeRequired') || undefined,
    companyName: searchParams.get('companyName') || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useJobSearch(params);

  // Show personalised recommendations only on the default view (no active
  // keyword/trade/company filter and first page) so they don't fight the search.
  const hasActiveFilters = Boolean(params.q || params.tradeRequired || params.companyName);
  const showRecommended = isCandidate && !hasActiveFilters && (params.page ?? 1) === 1;
  const { data: recommended } = useRecommendedJobs(showRecommended);
  const recommendedJobs = showRecommended ? recommended?.data ?? [] : [];

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

            <Field label={t('jobs:filters.keyword')}>
              <Input
                type="search"
                defaultValue={params.q ?? ''}
                placeholder={t('jobs:search.placeholder')}
                onBlur={(e) => setParam('q', e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setParam('q', e.currentTarget.value.trim());
                }}
              />
            </Field>

            <Field label={t('jobs:filters.location')}>
              <NativeSelect
                value={districtValue}
                onChange={(e) => setParam('district', e.target.value)}
              >
                <option value="all">{t('jobs:filters.anyLocation')}</option>
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

            <Button variant="ghost" onClick={clearFilters}>
              {t('common:actions.clear')}
            </Button>
          </CardBody>
        </Card>
      </aside>

      <div className="flex flex-col gap-6">
        {recommendedJobs.length > 0 && (
          <section aria-label={t('jobs:recommended.title')}>
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-content">{t('jobs:recommended.title')}</h2>
              <p className="text-base font-semibold text-content">{t('jobs:recommended.subtitle')}</p>
            </div>
            <ul className="flex flex-col gap-4">
              {recommendedJobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label={t('jobs:search.title')}>
          <div className="mb-4 flex items-center justify-between">
            <h1>{recommendedJobs.length > 0 ? t('jobs:recommended.allJobs') : t('jobs:search.title')}</h1>
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
    </div>
  );
}
