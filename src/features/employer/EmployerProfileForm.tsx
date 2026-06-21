import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { employerProfileSchema, type EmployerProfileForm } from './schema';
import type { EmployerProfile, EmployerProfileInput } from '@/api/types';
import { translateError } from '@/lib/validation';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  initial?: EmployerProfile;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (input: EmployerProfileInput) => void;
}

export function EmployerProfileFormFields({ initial, submitLabel, submitting, onSubmit }: Props) {
  const { t } = useTranslation(['employer', 'validation']);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerProfileForm>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: initial?.companyName ?? '',
      gstNumber: initial?.gstNumber ?? '',
      udyamNumber: initial?.udyamNumber ?? '',
    },
  });

  function submit(values: EmployerProfileForm) {
    const parsed = employerProfileSchema.parse(values);
    onSubmit({
      companyName: parsed.companyName,
      gstNumber: parsed.gstNumber || undefined,
      udyamNumber: parsed.udyamNumber || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <Field
        label={t('fields.companyName')}
        error={translateError(t, errors.companyName?.message)}
        required
      >
        <Input autoComplete="organization" {...register('companyName')} />
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
