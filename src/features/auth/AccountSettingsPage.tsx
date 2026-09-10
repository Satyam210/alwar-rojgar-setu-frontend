import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ChangePasswordForm } from './ChangePasswordForm';

export function AccountSettingsPage() {
  const { t } = useTranslation(['auth', 'common']);
  usePageTitle(t('auth:settings.title'));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6">{t('auth:settings.title')}</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('auth:changePassword.title')}</h2>
          <p className="mt-1 text-content-muted">{t('auth:changePassword.subtitle')}</p>
        </CardHeader>
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
