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
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden bg-brand-600 text-white">
        {/* Background photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${import.meta.env.BASE_URL}hero-bg.png')` }}
        />
        {/* Readability overlays — softer so the photo stays visible, strongest on the left where the text sits. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-700/80 via-brand-600/55 to-brand-500/15"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-700/40 to-transparent"
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
                <svg className="h-5 w-5 shrink-0 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('jobs:search.placeholder')}
                  aria-label={t('jobs:search.title')}
                  className="w-full bg-transparent py-2.5 text-content placeholder:text-content-muted focus-visible:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0 bg-accent-600 hover:bg-accent-700">
                {t('common:actions.search')}
              </Button>
            </div>
          </form>

          <div className="mt-4">
            <Link
              to={paths.jobs}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white no-underline backdrop-blur transition-colors hover:border-white/70 hover:bg-white/20"
            >
              {t('common:home.featured.viewAll')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

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
          icon={<BriefcaseIcon />}
          value={formatNumber(stats?.activeJobs ?? 0)}
          label={t('common:home.stats.activeJobs')}
        />
        <StatCard
          icon={<BuildingIcon />}
          value={formatNumber(stats?.registeredEmployers ?? 0)}
          label={t('common:home.stats.registeredEmployers')}
        />
        <StatCard
          icon={<CheckBadgeIcon />}
          value={formatNumber(stats?.successfulHires ?? 0)}
          label={t('common:home.stats.successfulHires')}
        />
      </section>

      {/* Featured employers */}
      <FeaturedCompanies />

      {/* Browse by trade */}
      <section aria-labelledby="trades-heading">
        <h2 id="trades-heading" className="mb-4 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"
          />
          {t('jobs:filters.trade')}
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {ITI_TRADES.map((trade) => (
            <Link
              key={trade}
              to={`${paths.jobs}?tradeRequired=${encodeURIComponent(trade)}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-content no-underline shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-brand-400 transition-colors group-hover:bg-brand-600"
              />
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

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-50"
      />
      <CardBody className="relative flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white"
        >
          {icon}
        </span>
        <div>
          <p className="text-3xl font-bold tracking-tight text-brand-800">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-content-muted">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

const iconProps = {
  className: 'h-7 w-7',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17" />
      <path d="M15 9h3a1 1 0 0 1 1 1v11" />
      <path d="M4 21h16" />
      <path d="M9 7h2M9 11h2M9 15h2" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l2.3 1.7 2.8-.2 1 2.6 2.4 1.5-.8 2.7.8 2.7-2.4 1.5-1 2.6-2.8-.2L12 21l-2.3-1.7-2.8.2-1-2.6L3.5 15l.8-2.7-.8-2.7 2.4-1.5 1-2.6 2.8.2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
