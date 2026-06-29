import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { jobSchema, type JobForm } from './schema';
import type { Job, JobInput } from '@/api/types';
import { translateError } from '@/lib/validation';
import { DISTRICTS, ITI_TRADES, JOB_TYPES } from '@/lib/constants';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Job;
  submitting?: boolean;
  onSubmit: (input: JobInput) => void;
}

export function JobFormModal({ open, onOpenChange, initial, submitting, onSubmit }: Props) {
  const { t } = useTranslation(['employer', 'jobs', 'common', 'validation']);
  const editing = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      grossSalary: initial?.grossSalary ?? undefined,
      netSalary: initial?.netSalary ?? undefined,
      jobType: initial?.jobType ?? 'permanent',
      openings: initial?.openings ?? 1,
      tradeRequired: initial?.tradeRequired ?? '',
      district: initial?.district ?? 'Alwar',
    },
  });

  useEffect(() => {
    reset({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      grossSalary: initial?.grossSalary ?? undefined,
      netSalary: initial?.netSalary ?? undefined,
      jobType: initial?.jobType ?? 'permanent',
      openings: initial?.openings ?? 1,
      tradeRequired: initial?.tradeRequired ?? '',
      district: initial?.district ?? 'Alwar',
    });
  }, [initial, reset]);

  function submit(values: JobForm) {
    const parsed = jobSchema.parse(values);
    onSubmit({ ...parsed, tradeRequired: parsed.tradeRequired || undefined });
    reset(values);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? t('employer:jobs.form.editTitle') : t('employer:jobs.form.createTitle')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
        <Field
          label={t('jobs:fields.title')}
          error={translateError(t, errors.title?.message)}
          required
        >
          <Input {...register('title')} />
        </Field>
        <Field
          label={t('jobs:fields.description')}
          error={translateError(t, errors.description?.message)}
          required
        >
          <Textarea {...register('description')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('jobs:fields.grossSalary')}
            error={translateError(t, errors.grossSalary?.message)}
            required
          >
            <Input type="number" inputMode="numeric" {...register('grossSalary')} />
          </Field>
          <Field
            label={t('jobs:fields.netSalary')}
            error={translateError(t, errors.netSalary?.message)}
            required
          >
            <Input type="number" inputMode="numeric" {...register('netSalary')} />
          </Field>
          <Field
            label={t('jobs:fields.jobType')}
            error={translateError(t, errors.jobType?.message)}
            required
          >
            <NativeSelect {...register('jobType')}>
              {JOB_TYPES.map((jt) => (
                <option key={jt.value} value={jt.value}>
                  {t(`jobs:type.${jt.value}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label={t('jobs:fields.openings')}
            error={translateError(t, errors.openings?.message)}
            required
          >
            <Input type="number" inputMode="numeric" min={1} {...register('openings')} />
          </Field>
          <Field label={t('jobs:fields.trade')} error={translateError(t, errors.tradeRequired?.message)}>
            <NativeSelect {...register('tradeRequired')}>
              <option value="">—</option>
              {ITI_TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label={t('jobs:fields.district')}
            error={translateError(t, errors.district?.message)}
            required
          >
            <NativeSelect {...register('district')}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('common:actions.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
