import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEmployerProfile, useUpdateEmployerProfile, useUploadEmployerLogo } from './queries';
import { EmployerProfileFormFields } from './EmployerProfileForm';
import { VerificationBanner } from './VerificationBanner';
import { fetchDocumentBlobUrl } from '@/api/documents';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CompanyBrandLogo } from '@/components/ui/CompanyLogo';
import { FileUpload } from '@/components/ui/FileUpload';
import { ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function EmployerProfilePage() {
  const { t } = useTranslation('employer');
  usePageTitle(t('profile.title'));
  const { data: profile, isLoading, isError, refetch } = useEmployerProfile();
  const update = useUpdateEmployerProfile();
  const uploadLogo = useUploadEmployerLogo();
  const [editing, setEditing] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>();

  // Resolve the stored logo (served auth-gated) into a displayable object URL.
  const logoUrl = profile?.logoUrl;
  useEffect(() => {
    if (!logoUrl) {
      setLogoSrc(undefined);
      return;
    }
    let revoke: string | undefined;
    let active = true;
    fetchDocumentBlobUrl(logoUrl).then((url) => {
      if (active && url) {
        revoke = url;
        setLogoSrc(url);
      }
    });
    return () => {
      active = false;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [logoUrl]);

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
        <CardBody className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4">
            <CompanyBrandLogo name={profile.companyName} src={logoSrc} />
            <div className="flex flex-col gap-1">
              <FileUpload
                label={t('profile.uploadLogo', { defaultValue: 'Upload logo' })}
                accept="image/png,image/jpeg,image/webp"
                onUpload={(file) => uploadLogo.mutateAsync(file)}
                onSuccess={() => toast.success(t('profile.saved'))}
                onError={(m) => toast.error(m)}
              />
              <p className="text-xs text-content-muted">
                {t('profile.logoHint', { defaultValue: 'PNG, JPG or WEBP.' })}
              </p>
            </div>
          </div>

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
              <div className="col-span-2">
                <dt className="text-sm text-content-muted">
                  {t('fields.companyDescription', { defaultValue: 'Company description' })}
                </dt>
                <dd className="whitespace-pre-line font-medium">
                  {profile.description || '—'}
                </dd>
              </div>
            </dl>
          )}
        </CardBody>
      </Card>
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
