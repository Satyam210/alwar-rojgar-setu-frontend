import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';

/**
 * GIGW / DPDP public footer (HLD §10): grievance officer details, policy links,
 * accessibility statement, helpline, last-updated and copyright.
 */
export function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();
  const officer = env.grievanceOfficer;

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-base font-semibold">{t('app.name')}</h2>
          <p className="mt-2 text-sm text-content-muted">{t('footer.aboutText')}</p>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h2 className="text-base font-semibold">{t('footer.quickLinks')}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link to={paths.jobs}>{t('nav.findJobs')}</Link>
            </li>
            <li>
              <Link to={paths.login}>{t('nav.login')}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('footer.legal')}>
          <h2 className="text-base font-semibold">{t('footer.legal')}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link to={paths.accessibility}>{t('footer.accessibility')}</Link>
            </li>
            <li>
              <Link to={paths.privacy}>{t('footer.privacy')}</Link>
            </li>
            <li>
              <Link to={paths.terms}>{t('footer.terms')}</Link>
            </li>
            <li>
              <Link to={paths.grievance}>{t('footer.grievance')}</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-base font-semibold">{t('footer.grievanceOfficer')}</h2>
          <address className="mt-2 space-y-0.5 text-sm not-italic text-content-muted">
            <p>{officer.name || t('footer.notProvided')}</p>
            {officer.designation && <p>{officer.designation}</p>}
            {officer.email && (
              <p>
                <a href={`mailto:${officer.email}`}>{officer.email}</a>
              </p>
            )}
            {officer.phone && (
              <p>
                <a href={`tel:${officer.phone}`}>{officer.phone}</a>
              </p>
            )}
          </address>
          <p className="mt-3 text-sm">
            {t('footer.helplineText')}{' '}
            <a href={`tel:${env.helplineNumber}`} className="font-medium">
              {env.helplineNumber}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm text-content-muted sm:flex-row sm:justify-between">
          <p>{t('footer.copyright', { year })}</p>
          <p>
            {t('footer.lastUpdated')}: {t('footer.notProvided')}
          </p>
        </div>
      </div>
    </footer>
  );
}
