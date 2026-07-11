import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';

/** Official Alwar district portals surfaced in the footer (like the Clean Alwar site). */
const USEFUL_LINKS: { key: string; href: string }[] = [
  { key: 'collectorate', href: 'https://alwar.rajasthan.gov.in/' },
  { key: 'tourism', href: 'https://tourism.rajasthan.gov.in/' },
  { key: 'zilaPortal', href: 'https://www.zilaalwar.in/' },
  { key: 'atulyaAlwar', href: 'https://www.atulyaalwar.in/' },
];

type SocialKey = keyof typeof env.social;

const SOCIAL_META: Record<SocialKey, { label: string; icon: JSX.Element; background: string }> = {
  facebook: { label: 'Facebook', icon: <FacebookIcon />, background: '#1877F2' },
  instagram: {
    label: 'Instagram',
    icon: <InstagramIcon />,
    // Instagram's signature gradient.
    background:
      'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
  },
  twitter: { label: 'X (Twitter)', icon: <TwitterIcon />, background: '#000000' },
  youtube: { label: 'YouTube', icon: <YoutubeIcon />, background: '#FF0000' },
};

/**
 * GIGW / DPDP public footer (HLD §10): grievance officer details, policy links,
 * accessibility statement, helpline, last-updated and copyright.
 */
export function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();
  const officer = env.grievanceOfficer;

  const socialKeys = (Object.keys(SOCIAL_META) as SocialKey[]).filter((key) =>
    Boolean(env.social[key]),
  );

  return (
    <footer className="mt-auto border-t border-accent-100 bg-accent-50 text-content-muted [&_a:hover]:text-brand-900 [&_a:hover]:underline [&_a]:text-brand-700">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <h2 className="text-base font-semibold text-content">{t('app.name')}</h2>
          <p className="mt-2 text-sm text-content-muted">{t('footer.aboutText')}</p>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h2 className="text-base font-semibold text-content">{t('footer.quickLinks')}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link to={paths.jobs}>{t('nav.findJobs')}</Link>
            </li>
            <li>
              <Link to={paths.login}>{t('nav.login')}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('footer.usefulLinks')}>
          <h2 className="text-base font-semibold text-content">{t('footer.usefulLinks')}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {USEFUL_LINKS.map((link) => (
              <li key={link.key}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {t(`footer.links.${link.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.legal')}>
          <h2 className="text-base font-semibold text-content">{t('footer.legal')}</h2>
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
          <h2 className="text-base font-semibold text-content">{t('footer.grievanceOfficer')}</h2>
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

      <div className="border-t border-accent-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-content-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.copyright', { year })}</p>

          <div className="flex items-center gap-4">
            {socialKeys.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="sr-only">{t('footer.followUs')}</span>
                {socialKeys.map((key) => (
                  <a
                    key={key}
                    href={env.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_META[key].label}
                    style={{ background: SOCIAL_META[key].background }}
                    className="flex h-8 w-8 items-center justify-center rounded-full !text-white transition-opacity hover:opacity-90 hover:!text-white hover:!no-underline"
                  >
                    {SOCIAL_META[key].icon}
                  </a>
                ))}
              </div>
            )}
            {env.lastUpdated && (
              <p>
                {t('footer.lastUpdated')}: {env.lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialIconProps = {
  className: 'h-4 w-4',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
};

function FacebookIcon() {
  return (
    <svg {...socialIconProps}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg {...socialIconProps}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg {...socialIconProps}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...socialIconProps}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.5a6.34 6.34 0 1 0 0 12.68 6.34 6.34 0 0 0 0-12.68zm0 10.46a4.12 4.12 0 1 1 0-8.24 4.12 4.12 0 0 1 0 8.24zm6.58-10.7a1.48 1.48 0 1 1-2.96 0 1.48 1.48 0 0 1 2.96 0z" />
    </svg>
  );
}
