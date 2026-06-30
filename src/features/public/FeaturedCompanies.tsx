import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { Card, CardBody } from '@/components/ui/Card';
import { CompanyBrandLogo } from '@/components/ui/CompanyLogo';

type RoleType = 'unskilled' | 'graduate';

interface FeaturedCompany {
  id: string;
  name: string;
  /** File under public/logos. Omitted when a real logo is unavailable. */
  logo?: string;
  location: string;
  roleTypes: RoleType[];
}

interface Sector {
  id: 'manufacturing' | 'banking';
  companies: FeaturedCompany[];
}

/**
 * Curated list of major employers actively hiring in and around Alwar.
 * Logos live in public/logos; missing ones fall back to a branded monogram.
 */
const SECTORS: Sector[] = [
  {
    id: 'manufacturing',
    companies: [
      {
        id: 'havells',
        name: 'Havells India Ltd.',
        logo: 'logos/havells.png',
        location: 'Matsya Industrial Area (MIA), Alwar',
        roleTypes: ['unskilled', 'graduate'],
      },
      {
        id: 'hero',
        name: 'Hero MotoCorp',
        logo: 'logos/heromotocorp.png',
        location: 'Alwar regional operations',
        roleTypes: ['unskilled', 'graduate'],
      },
      {
        id: 'rspl',
        name: 'RSPL Ltd. (Ghari)',
        logo: 'logos/rspl.png',
        location: 'MIA, Alwar',
        roleTypes: ['unskilled', 'graduate'],
      },
    ],
  },
  {
    id: 'banking',
    companies: [
      {
        id: 'aubank',
        name: 'AU Small Finance Bank',
        logo: 'logos/aubank.png',
        location: 'Alwar branches',
        roleTypes: ['graduate'],
      },
      {
        id: 'hdfc',
        name: 'HDFC Bank',
        logo: 'logos/hdfc.png',
        location: 'Alwar branches',
        roleTypes: ['graduate'],
      },
      {
        id: 'icici',
        name: 'ICICI Bank',
        logo: 'logos/icici.png',
        location: 'Alwar branches',
        roleTypes: ['graduate'],
      },
      {
        id: 'tatacapital',
        name: 'Tata Capital',
        logo: 'logos/tatacapital.png',
        location: 'Alwar',
        roleTypes: ['graduate'],
      },
      {
        id: 'bajaj',
        name: 'Bajaj Finserv',
        logo: 'logos/bajajfinserv.png',
        location: 'Alwar',
        roleTypes: ['graduate'],
      },
    ],
  },
];

export function FeaturedCompanies() {
  const { t } = useTranslation('common');
  const base = import.meta.env.BASE_URL;

  return (
    <section aria-labelledby="featured-heading">
      <div className="mb-6">
        <h2 id="featured-heading" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"
          />
          {t('home.featured.title')}
        </h2>
        <p className="mt-1.5 max-w-2xl font-medium text-content">{t('home.featured.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-8">
        {SECTORS.map((sector) => (
          <div key={sector.id}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                {t(`home.featured.sectors.${sector.id}`)}
              </h3>
              <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sector.companies.map((company) => (
                <Link
                  key={company.id}
                  to={`${paths.jobs}?companyName=${encodeURIComponent(company.name)}`}
                  className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Card className="h-full cursor-pointer rounded-xl border border-border bg-white shadow-sm transition-shadow duration-150 group-hover:shadow-md">
                    <CardBody className="flex h-full flex-col gap-3.5">
                      <div className="flex items-center gap-3">
                        <CompanyBrandLogo
                          name={company.name}
                          src={company.logo ? `${base}${company.logo}` : undefined}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold leading-snug">{company.name}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-content-muted">
                            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {company.location}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-content-muted">
                        {t(`home.featured.companies.${company.id}`)}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                        {company.roleTypes.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100"
                          >
                            {t(`home.featured.roleType.${role}`)}
                          </span>
                        ))}
                        <span className="ml-auto text-xs font-semibold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                          {t('home.featured.viewJobs')} →
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 text-center">
        <Link
          to={paths.jobs}
          className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-accent-700"
        >
          {t('home.featured.viewAll')} →
        </Link>
      </div>
    </section>
  );
}
