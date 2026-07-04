import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { employerProfileSchema, type EmployerProfileForm } from './schema';
import type { EmployerProfile, EmployerProfileInput } from '@/api/types';
import { translateError } from '@/lib/validation';
import { Field } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CompanyBrandLogo } from '@/components/ui/CompanyLogo';

interface Props {
  initial?: EmployerProfile;
  submitLabel: string;
  submitting?: boolean;
  /** Show an optional logo picker (used during onboarding, before the profile exists). */
  showLogo?: boolean;
  /** The optional logo file is passed alongside the profile input so the caller can upload it. */
  onSubmit: (input: EmployerProfileInput, logoFile?: File) => void;
}

export function EmployerProfileFormFields({
  initial,
  submitLabel,
  submitting,
  showLogo,
  onSubmit,
}: Props) {
  const { t } = useTranslation(['employer', 'common', 'validation']);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmployerProfileForm>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: initial?.companyName ?? '',
      companyDescription: initial?.companyDescription ?? '',
      gstNumber: initial?.gstNumber ?? '',
      udyamNumber: initial?.udyamNumber ?? '',
    },
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>();
  const companyName = watch('companyName');

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  function submit(values: EmployerProfileForm) {
    const parsed = employerProfileSchema.parse(values);
    onSubmit(
      {
        companyName: parsed.companyName,
        companyDescription: parsed.companyDescription || undefined,
        gstNumber: parsed.gstNumber || undefined,
        udyamNumber: parsed.udyamNumber || undefined,
      },
      logoFile ?? undefined,
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      {showLogo && (
        <div className="flex flex-wrap items-center gap-4">
          <CompanyBrandLogo name={companyName || '?'} src={logoPreview} />
          <div className="flex flex-col gap-1">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label={t('profile.uploadLogo', { defaultValue: 'Upload logo' })}
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
              >
                {t('profile.uploadLogo', { defaultValue: 'Upload logo' })}
              </Button>
              {logoFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogoFile(null);
                    if (logoInputRef.current) logoInputRef.current.value = '';
                  }}
                >
                  {t('common:actions.remove', { defaultValue: 'Remove' })}
                </Button>
              )}
            </div>
            <p className="text-xs text-content-muted">
              {t('fields.logoOptionalHint', {
                defaultValue: "Optional. If you skip it, we'll use your company initials.",
              })}
            </p>
          </div>
        </div>
      )}

      <Field
        label={t('fields.companyName')}
        error={translateError(t, errors.companyName?.message)}
        required
      >
        <Input autoComplete="organization" {...register('companyName')} />
      </Field>
      <Field
        label={t('fields.companyDescription', { defaultValue: 'Company description' })}
        error={translateError(t, errors.companyDescription?.message)}
      >
        <Textarea
          rows={4}
          placeholder={t('fields.companyDescriptionPlaceholder', {
            defaultValue: 'Tell candidates about your company…',
          })}
          {...register('companyDescription')}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fields.gstNumber')} error={translateError(t, errors.gstNumber?.message)}>
          <Input {...register('gstNumber')} />
        </Field>
        <Field
          label={t('fields.udyamNumber')}
          error={translateError(t, errors.udyamNumber?.message)}
        >
          <Input {...register('udyamNumber')} />
        </Field>
      </div>
      <div>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
