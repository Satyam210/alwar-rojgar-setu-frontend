import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';
import { Card, CardBody } from '@/components/ui/Card';

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  usePageTitle(title);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4">{title}</h1>
      <Card>
        <CardBody className="flex flex-col gap-4 leading-relaxed text-content">{children}</CardBody>
      </Card>
    </div>
  );
}

export function AccessibilityPage() {
  const { t } = useTranslation('common');
  return (
    <Prose title={t('footer.accessibility')}>
      <p>
        Alwar Rojgar Setu is committed to meeting GIGW 3.0 and WCAG 2.1 Level AA. The site supports
        keyboard navigation, screen readers, resizable text, and a high-contrast mode (see the
        accessibility toolbar at the top of every page).
      </p>
      <p>
        Pages use semantic landmarks, descriptive labels, and visible focus indicators. Content is
        available in English and Hindi. If you face any accessibility barrier, please contact our
        helpline at {env.helplineNumber}.
      </p>
    </Prose>
  );
}

export function PrivacyPage() {
  const { t } = useTranslation('common');
  return (
    <Prose title={t('footer.privacy')}>
      <p>
        This platform collects only the information needed to connect job seekers with employers
        (mobile number, profile details, and uploaded documents). Data is processed in line with the
        Digital Personal Data Protection Act, 2023.
      </p>
      <p>
        You may request correction or deletion of your data by contacting the Grievance Officer
        listed in the footer. We do not sell your personal data.
      </p>
    </Prose>
  );
}

export function TermsPage() {
  const { t } = useTranslation('common');
  return (
    <Prose title={t('footer.terms')}>
      <p>
        By using Alwar Rojgar Setu you agree to provide honest information. Employers must post
        genuine vacancies with accurate salary details. Misuse may result in account suspension.
      </p>
      <p>
        The District Administration, Alwar facilitates connections but is not a party to any
        employment contract between candidates and employers.
      </p>
    </Prose>
  );
}

export function GrievancePage() {
  const { t } = useTranslation('common');
  const o = env.grievanceOfficer;
  return (
    <Prose title={t('footer.grievance')}>
      <p>
        If you have a complaint about a job posting, an employer, or how your data is handled, please
        contact our Grievance Officer (as required under the DPDP Act, 2023):
      </p>
      <address className="not-italic">
        <p className="font-semibold">{o.name || t('footer.notProvided')}</p>
        {o.designation && <p>{o.designation}</p>}
        {o.email && (
          <p>
            <a href={`mailto:${o.email}`}>{o.email}</a>
          </p>
        )}
        {o.phone && (
          <p>
            <a href={`tel:${o.phone}`}>{o.phone}</a>
          </p>
        )}
      </address>
      <p>
        You can also call our helpline at{' '}
        <a href={`tel:${env.helplineNumber}`}>{env.helplineNumber}</a>.
      </p>
    </Prose>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation('common');
  usePageTitle(t('states.notFoundTitle'));
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-5xl font-bold text-brand-800">404</p>
      <h1>{t('states.notFoundTitle')}</h1>
      <p className="text-content-muted">{t('states.notFoundBody')}</p>
      <Link to={paths.home} className="font-medium">
        {t('states.goHome')}
      </Link>
    </div>
  );
}
