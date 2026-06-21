import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { formatCurrency } from '@/lib/format';

/** Convert a #rrggbb hex to an rgba() string so we can tint per-company accents. */
function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Vacancy {
  title: string;
  description: string;
  salary: number;
  trade: string;
}

interface FeaturedCompany {
  id: string;
  name: string;
  /** Short monogram shown inside the logo mark. */
  mark: string;
  /** Brand colour for the logo (hex). */
  color: string;
  sector: string;
  vacancies: Vacancy[];
}

/**
 * Curated showcase of local employers for the homepage. Static data (no backend
 * dependency) so the landing page always looks active. Company names are
 * illustrative of Alwar/Bhiwadi's industrial base; logos are rendered as styled
 * wordmarks to avoid third-party trademarks.
 */
const FEATURED_COMPANIES: FeaturedCompany[] = [
  {
    id: 'shakti-electricals',
    name: 'Shakti Electricals',
    mark: 'SE',
    color: '#1d4ed8',
    sector: 'Electrical equipment manufacturing',
    vacancies: [
      {
        title: 'Electrician – Panel Assembly',
        description:
          'Assemble and wire LT control panels on the shop floor. ITI Electrician with panel wiring exposure preferred. PF/ESI + skill bonus.',
        salary: 18500,
        trade: 'Electrician',
      },
      {
        title: 'Wireman – Switchgear Unit',
        description:
          'Crimping, harnessing and continuity testing for switchgear. Day shift, on-the-job training provided.',
        salary: 17000,
        trade: 'Wireman',
      },
    ],
  },
  {
    id: 'suraksha-auto',
    name: 'Suraksha Auto Components',
    mark: 'SA',
    color: '#b91c1c',
    sector: 'Automotive components',
    vacancies: [
      {
        title: 'ITI Fitter – Assembly Line',
        description:
          'Fitment and quality checks on a 2-wheeler component line. Freshers from ITI Fitter trade welcome. Canteen + transport.',
        salary: 19500,
        trade: 'Fitter',
      },
      {
        title: 'CNC Machinist',
        description:
          'Operate and set CNC turning centres. Blueprint reading and basic GD&T knowledge an advantage.',
        salary: 21000,
        trade: 'Machinist',
      },
    ],
  },
  {
    id: 'marudhara-steel',
    name: 'Marudhara Steel & Fabrication',
    mark: 'MS',
    color: '#b45309',
    sector: 'Steel fabrication',
    vacancies: [
      {
        title: 'Welder – Structural Fab Shop',
        description:
          'MIG/Arc welding on structural assemblies. ITI Welder with 1+ yr experience preferred; freshers considered.',
        salary: 22000,
        trade: 'Welder',
      },
      {
        title: 'Turner – Machine Shop',
        description:
          'Conventional lathe operations to drawing. Steady shift timings with overtime available.',
        salary: 20000,
        trade: 'Turner',
      },
    ],
  },
  {
    id: 'rajcool-appliances',
    name: 'RajCool Appliances',
    mark: 'RC',
    color: '#0f766e',
    sector: 'Refrigeration & cooling',
    vacancies: [
      {
        title: 'Refrigeration & AC Technician',
        description:
          'Sub-assembly and gas charging for cooling units. ITI RAC trade. Health cover from day one.',
        salary: 18000,
        trade: 'Refrigeration & AC',
      },
      {
        title: 'Diesel Mechanic – Maintenance',
        description:
          'Preventive maintenance of plant gensets and material handlers. Diploma/ITI Diesel Mechanic.',
        salary: 23000,
        trade: 'Diesel Mechanic',
      },
    ],
  },
];

export function FeaturedCompanies() {
  const { t } = useTranslation(['common', 'jobs']);

  return (
    <section aria-labelledby="featured-heading">
      <div className="mb-5">
        <h2 id="featured-heading">{t('common:home.featured.title')}</h2>
        <p className="text-content-muted">{t('common:home.featured.subtitle')}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {FEATURED_COMPANIES.map((company) => (
          <article
            key={company.id}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* Coloured accent strip */}
            <div aria-hidden="true" className="h-1.5" style={{ backgroundColor: company.color }} />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 pb-4 pt-4"
              style={{ backgroundColor: tint(company.color, 0.06) }}
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-extrabold tracking-tight text-white shadow-sm"
                style={{ backgroundColor: company.color }}
              >
                {company.mark}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-base font-bold leading-tight"
                  style={{ color: company.color }}
                >
                  {company.name}
                </p>
                <p className="truncate text-xs text-content-muted">{company.sector}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-success">
                <span aria-hidden="true">✓</span>
                {t('common:home.featured.verified')}
              </span>
            </div>

            {/* Vacancies */}
            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">
                {t('common:home.featured.roles', { count: company.vacancies.length })}
              </p>
              <ul className="flex flex-col gap-3">
                {company.vacancies.map((v) => (
                  <li
                    key={v.title}
                    className="rounded-lg border border-border p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className="font-semibold leading-snug">{v.title}</p>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-success">
                        {formatCurrency(v.salary)}
                        <span className="ml-0.5 font-medium text-success/80">
                          {t('jobs:card.perMonth')}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-content-muted">{v.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {v.trade}
                      </span>
                      <Link
                        to={`${paths.jobs}?tradeRequired=${encodeURIComponent(v.trade)}`}
                        className="text-sm font-medium no-underline hover:underline"
                      >
                        {t('common:home.featured.viewJobs')} →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer CTA */}
            <Link
              to={paths.jobs}
              className="border-t border-border px-5 py-3 text-center text-sm font-semibold text-brand-700 no-underline transition-colors hover:bg-surface-muted"
            >
              {t('common:home.featured.viewAll')} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
