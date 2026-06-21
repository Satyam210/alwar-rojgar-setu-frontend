import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePublicStats } from './queries';
import { ITI_TRADES } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { FeaturedCompanies } from './FeaturedCompanies';

export function HomePage() {
  const { t } = useTranslation(['common', 'jobs']);
  usePageTitle('');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Light-touch live stats (HLD §4 homepage: search bar + live stats).
  const { data: stats } = usePublicStats();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('tradeRequired', query.trim());
    navigate(`${paths.jobs}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero + search — full-bleed band with a background photo. */}
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden bg-brand-900 text-white">
        {/* Background photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${import.meta.env.BASE_URL}hero-bg.png')` }}
        />
        {/* Readability overlays — strong on the left where the text sits. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/85 to-brand-900/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-900/70 to-transparent"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-brand-50 backdrop-blur">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-200" />
            {t('common:home.hero.eyebrow')}
          </span>

          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            {t('common:app.tagline')}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-brand-100 sm:text-lg">
            {t('common:footer.aboutText')}
          </p>

          <form onSubmit={onSearch} className="mt-7 max-w-2xl" role="search">
            <div className="flex flex-col gap-2 rounded-xl bg-white/95 p-2 shadow-lg ring-1 ring-white/20 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-2">
                <span aria-hidden="true" className="text-content-muted">
                  🔍
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('jobs:search.placeholder')}
                  aria-label={t('jobs:search.title')}
                  className="w-full bg-transparent py-2.5 text-content placeholder:text-content-muted focus-visible:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                {t('common:actions.search')}
              </Button>
            </div>
          </form>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-50">
            <TrustChip label={t('common:home.trust.verified')} />
            <TrustChip label={t('common:home.trust.free')} />
            <TrustChip label={t('common:home.trust.local')} />
          </ul>
        </div>
      </section>

      {/* Live stats */}
      <section aria-labelledby="stats-heading" className="grid gap-4 sm:grid-cols-3">
        <h2 id="stats-heading" className="sr-only">
          {t('common:footer.about')}
        </h2>
        <StatCard
          value={formatNumber(stats?.activeJobs ?? 0)}
          label={t('common:home.stats.activeJobs')}
        />
        <StatCard
          value={formatNumber(stats?.registeredEmployers ?? 0)}
          label={t('common:home.stats.registeredEmployers')}
        />
        <StatCard
          value={formatNumber(stats?.successfulHires ?? 0)}
          label={t('common:home.stats.successfulHires')}
        />
      </section>

      {/* Featured employers */}
      <FeaturedCompanies />

      {/* Browse by trade */}
      <section aria-labelledby="trades-heading">
        <h2 id="trades-heading" className="mb-4">
          {t('jobs:filters.trade')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {ITI_TRADES.map((trade) => (
            <Link
              key={trade}
              to={`${paths.jobs}?tradeRequired=${encodeURIComponent(trade)}`}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm no-underline hover:bg-surface-muted"
            >
              {trade}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrustChip({ label }: { label: string }) {
  return (
    <li className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold"
      >
        ✓
      </span>
      {label}
    </li>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-brand-600 transition-shadow hover:shadow-md">
      <CardBody>
        <p className="text-4xl font-extrabold tracking-tight text-brand-800">{value}</p>
        <p className="mt-1 text-content-muted">{label}</p>
      </CardBody>
    </Card>
  );
}
