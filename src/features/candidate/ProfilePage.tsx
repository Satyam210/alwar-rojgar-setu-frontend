import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCandidateProfile, useUpdateCandidateProfile } from './queries';
import { CandidateProfileFormFields } from './CandidateProfileForm';
import { DocumentsSection } from './DocumentsSection';
import { formatCurrency, formatExperience } from '@/lib/format';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function CandidateProfilePage() {
  const { t } = useTranslation('candidate');
  usePageTitle(t('profile.title'));
  const { data: profile, isLoading, isError, refetch } = useCandidateProfile();
  const update = useUpdateCandidateProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingState />;
  if (isError || !profile) return <ErrorState onRetry={refetch} />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1>{t('profile.title')}</h1>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            {t('profile.edit')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg">{t('profile.sections.basic')}</h2>
        </CardHeader>
        <CardBody>
          {editing ? (
            <CandidateProfileFormFields
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
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Item label={t('fields.fullName')} value={profile.fullName} />
              <Item label={t('fields.email')} value={profile.email} />
              <Item label={t('fields.highestEducation')} value={profile.highestEducation} />
              <Item label={t('fields.itiTrade')} value={profile.itiTrade} />
              <Item label={t('fields.itiCollege')} value={profile.itiCollege} />
              <Item label={t('fields.department')} value={profile.department} />
              <Item
                label={t('fields.workExperienceMonths')}
                value={formatExperience(profile.workExperienceMonths)}
              />
              <Item label={t('fields.expectedSalary')} value={formatCurrency(profile.expectedSalary)} />
              <Item label={t('fields.city')} value={profile.city} />
              <Item label={t('fields.district')} value={profile.district} />
              <Item label={t('fields.pincode')} value={profile.pincode} />
              {profile.skills && profile.skills.length > 0 && (
                <div className="col-span-full">
                  <dt className="text-sm text-content-muted">{t('fields.skills')}</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {profile.skills.map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </CardBody>
      </Card>

      <DocumentsSection profile={profile} />
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
