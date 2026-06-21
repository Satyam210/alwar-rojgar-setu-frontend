import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCreateEmployerProfile } from './queries';
import { EmployerProfileFormFields } from './EmployerProfileForm';
import { paths } from '@/routes/paths';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { toast } from '@/components/ui/toast';

export function EmployerOnboardingPage() {
  const { t } = useTranslation('employer');
  usePageTitle(t('onboarding.title'));
  const navigate = useNavigate();
  const create = useCreateEmployerProfile();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <h1>{t('onboarding.title')}</h1>
          <p className="mt-1 text-content-muted">{t('onboarding.subtitle')}</p>
        </CardHeader>
        <CardBody>
          <EmployerProfileFormFields
            submitLabel={t('onboarding.submit')}
            submitting={create.isPending}
            onSubmit={(input) =>
              create.mutate(input, {
                onSuccess: () => {
                  toast.success(t('profile.saved'));
                  navigate(paths.employer.profile);
                },
                onError: (err) => toast.error(apiErrorMessage(err)),
              })
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
