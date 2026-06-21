import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEmployerProfile, useUpdateEmployerProfile } from './queries';
import { EmployerProfileFormFields } from './EmployerProfileForm';
import { EmployerDocumentsSection } from './DocumentsSection';
import { VerificationBanner } from './VerificationBanner';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function EmployerProfilePage() {
  const { t } = useTranslation('employer');
  usePageTitle(t('profile.title'));
  const { data: profile, isLoading, isError, refetch } = useEmployerProfile();
  const update = useUpdateEmployerProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingState />;
  if (isError || !profile) return <ErrorState onRetry={refetch} />;

  const isHrHead = profile.employerRole === 'hr_head';

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1>{t('profile.title')}</h1>
        <Badge tone={isHrHead ? 'info' : 'neutral'}>
          {isHrHead ? t('account.roleHrHead') : t('account.roleOwner')}
        </Badge>
      </div>

      {isHrHead && (
        <div className="rounded border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900">
          {t('account.hrHeadNote')}
        </div>
      )}

      <VerificationBanner profile={profile} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg">{t('fields.companyName')}</h2>
            {!editing && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {t('profile.edit')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <EmployerProfileFormFields
              initial={profile}
              submitLabel={t('actions.save', { ns: 'common', defaultValue: 'Save' })}
              submitting={update.isPending}
              onSubmit={(input) =>
                update.mutate(input, {
                  onSuccess: () => {
                    toast.success(t('profile.saved'));
                    setEditing(false);
                  },
                  onError: (err) => toast.error(apiErrorMessage(err)),
                })
              }
            />
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              <Item label={t('fields.companyName')} value={profile.companyName} />
              <Item label={t('fields.contactPerson')} value={profile.contactPersonName} />
              <Item label={t('fields.gstNumber')} value={profile.gstNumber} />
              <Item label={t('fields.udyamNumber')} value={profile.udyamNumber} />
            </dl>
          )}
        </CardBody>
      </Card>

      <EmployerDocumentsSection />
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm text-content-muted">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}
