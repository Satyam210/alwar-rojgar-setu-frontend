import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { candidateProfileSchema, type CandidateProfileForm } from './schema';
import type { CandidateProfile, CandidateProfileInput } from '@/api/types';
import { translateError } from '@/lib/validation';
import {
  ALWAR_COLLEGES,
  DISTRICTS,
  EDUCATION_LEVELS,
  ITI_DEPARTMENTS,
  ITI_TRADES,
} from '@/lib/constants';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkillsInput } from './SkillsInput';

interface Props {
  initial?: CandidateProfile;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (input: CandidateProfileInput) => void;
}

export function CandidateProfileFormFields({ initial, submitting, submitLabel, onSubmit }: Props) {
  const { t } = useTranslation(['candidate', 'common', 'validation']);
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateProfileForm>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      email: initial?.email ?? '',
      description: initial?.description ?? '',
      highestEducation: initial?.highestEducation ?? '',
      itiTrade: initial?.itiTrade ?? '',
      itiCollege: initial?.itiCollege ?? '',
      department: initial?.department ?? '',
      graduationYear: initial?.graduationYear ?? undefined,
      workExperienceMonths: initial?.workExperienceMonths ?? undefined,
      city: initial?.city ?? '',
      district: initial?.district ?? 'Alwar',
      pincode: initial?.pincode ?? '',
    },
  });

  function submit(values: CandidateProfileForm) {
    const parsed = candidateProfileSchema.parse(values);
    onSubmit({
      ...parsed,
      email: parsed.email || undefined,
      description: parsed.description || undefined,
      skills,
    } as CandidateProfileInput);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6" noValidate>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">{t('profile.sections.basic')}</legend>
        <Field
          label={t('fields.fullName')}
          error={translateError(t, errors.fullName?.message)}
          required
        >
          <Input autoComplete="name" {...register('fullName')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('fields.phone')}
            help={t('fields.phoneHelp')}
            error={translateError(t, errors.phone?.message)}
            required
          >
            <Input type="tel" inputMode="numeric" maxLength={10} autoComplete="tel" {...register('phone')} />
          </Field>
          <Field
            label={t('fields.email')}
            help={t('fields.emailHelp')}
            error={translateError(t, errors.email?.message)}
          >
            <Input type="email" autoComplete="email" {...register('email')} />
          </Field>
        </div>
        <Field
          label={t('fields.description')}
          help={t('fields.descriptionHelp')}
          error={translateError(t, errors.description?.message)}
        >
          <Textarea rows={4} {...register('description')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('fields.city')} error={translateError(t, errors.city?.message)}>
            <Input {...register('city')} />
          </Field>
          <Field label={t('fields.district')} error={translateError(t, errors.district?.message)}>
            <NativeSelect {...register('district')}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t('fields.pincode')} error={translateError(t, errors.pincode?.message)}>
            <Input inputMode="numeric" maxLength={6} {...register('pincode')} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">{t('profile.sections.education')}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('fields.highestEducation')}
            error={translateError(t, errors.highestEducation?.message)}
          >
            <NativeSelect {...register('highestEducation')}>
              <option value="">—</option>
              {EDUCATION_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t('fields.itiTrade')} error={translateError(t, errors.itiTrade?.message)}>
            <NativeSelect {...register('itiTrade')}>
              <option value="">—</option>
              {ITI_TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label={t('fields.itiCollege')}
            help={t('fields.itiCollegeHelp')}
            error={translateError(t, errors.itiCollege?.message)}
          >
            <Input
              {...register('itiCollege')}
              list="college-suggestions"
              placeholder={t('fields.itiCollegePlaceholder')}
              autoComplete="off"
            />
            <datalist id="college-suggestions">
              {ALWAR_COLLEGES.map((college) => (
                <option key={college} value={college} />
              ))}
            </datalist>
          </Field>
          <Field
            label={t('fields.department')}
            error={translateError(t, errors.department?.message)}
          >
            <NativeSelect {...register('department')}>
              <option value="">—</option>
              {ITI_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label={t('fields.graduationYear')}
            error={translateError(t, errors.graduationYear?.message)}
          >
            <Input type="number" inputMode="numeric" {...register('graduationYear')} />
          </Field>
          <Field
            label={t('fields.workExperienceMonths')}
            error={translateError(t, errors.workExperienceMonths?.message)}
          >
            <Input type="number" inputMode="numeric" {...register('workExperienceMonths')} />
          </Field>
        </div>
        <Field label={t('fields.skills')} help={t('fields.skillsHelp')}>
          <SkillsInput value={skills} onChange={setSkills} />
        </Field>
      </fieldset>

      <div>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
