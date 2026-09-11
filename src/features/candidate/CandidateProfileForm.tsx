import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { candidateProfileSchema, type CandidateProfileForm } from './schema';
import type { CandidateProfile, CandidateProfileInput } from '@/api/types';
import { translateError } from '@/lib/validation';
import {
  DISTRICTS,
  EDUCATION_LEVELS,
  ITI_COLLEGES,
  ITI_DEPARTMENTS,
  ITI_TRADES,
  OTHER_COLLEGE,
  OTHER_DISTRICT,
  OTHER_TOWN,
  TOWNS_BY_DISTRICT,
  type District,
} from '@/lib/constants';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkillsInput } from './SkillsInput';

interface Props {
  initial?: CandidateProfile;
  /** Email from the signed-in account, used to pre-fill the (locked) email field on onboarding. */
  defaultEmail?: string;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (input: CandidateProfileInput) => void;
}

export function CandidateProfileFormFields({
  initial,
  defaultEmail,
  submitting,
  submitLabel,
  onSubmit,
}: Props) {
  const { t } = useTranslation(['candidate', 'common', 'validation']);
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);

  // College is a dropdown of Alwar-district ITIs plus an "Other" free-text option.
  const initialCollege = initial?.itiCollege ?? '';
  const [collegeIsOther, setCollegeIsOther] = useState<boolean>(
    Boolean(initialCollege) && !ITI_COLLEGES.includes(initialCollege as (typeof ITI_COLLEGES)[number]),
  );

  // Town/City is a dependent dropdown filtered by the chosen district, plus an
  // "Other" free-text option for towns not in the list.
  const initialCity = initial?.city ?? '';
  const initialDistrict = (initial?.district ?? 'Alwar') as District;
  const [districtIsOther, setDistrictIsOther] = useState<boolean>(
    Boolean(initial?.district) && !DISTRICTS.includes(initialDistrict),
  );
  const [cityIsOther, setCityIsOther] = useState<boolean>(
    Boolean(initialCity) && !(TOWNS_BY_DISTRICT[initialDistrict] ?? []).includes(initialCity),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CandidateProfileForm>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      email: initial?.email ?? defaultEmail ?? '',
      description: initial?.description ?? '',
      gender: initial?.gender ?? '',
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

  // Towns available for the currently-selected district (dependent dropdown).
  const selectedDistrict = (watch('district') ?? 'Alwar') as District;
  const townOptions = TOWNS_BY_DISTRICT[selectedDistrict] ?? [];

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
          >
            <Input type="email" autoComplete="email" readOnly disabled {...register('email')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.gender')}>
            <NativeSelect {...register('gender')}>
              <option value="">—</option>
              <option value="male">{t('fields.genderOptions.male')}</option>
              <option value="female">{t('fields.genderOptions.female')}</option>
              <option value="other">{t('fields.genderOptions.other')}</option>
              <option value="prefer_not_to_say">{t('fields.genderOptions.prefer_not_to_say')}</option>
            </NativeSelect>
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
          <Field label={t('fields.district')} error={translateError(t, errors.district?.message)}>
            <NativeSelect
              value={districtIsOther ? OTHER_DISTRICT : selectedDistrict}
              onChange={(e) => {
                const value = e.target.value;
                // Changing district always invalidates the town selection — reset it.
                setValue('city', '');
                setCityIsOther(false);
                if (value === OTHER_DISTRICT) {
                  setDistrictIsOther(true);
                  setValue('district', '');
                } else {
                  setDistrictIsOther(false);
                  setValue('district', value);
                }
              }}
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value={OTHER_DISTRICT}>{t('fields.districtOther')}</option>
            </NativeSelect>
            {districtIsOther && (
              <Input
                {...register('district')}
                className="mt-2"
                placeholder={t('fields.districtOtherPlaceholder')}
                autoComplete="off"
                aria-label={t('fields.districtOtherPlaceholder')}
              />
            )}
          </Field>
          <Field label={t('fields.city')} error={translateError(t, errors.city?.message)}>
            <NativeSelect
              value={cityIsOther ? OTHER_TOWN : (watch('city') ?? '')}
              onChange={(e) => {
                const value = e.target.value;
                if (value === OTHER_TOWN) {
                  setCityIsOther(true);
                  setValue('city', '');
                } else {
                  setCityIsOther(false);
                  setValue('city', value);
                }
              }}
            >
              <option value="">—</option>
              {townOptions.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
              <option value={OTHER_TOWN}>{t('fields.cityOther')}</option>
            </NativeSelect>
            {cityIsOther && (
              <Input
                {...register('city')}
                className="mt-2"
                placeholder={t('fields.cityOtherPlaceholder')}
                autoComplete="off"
                aria-label={t('fields.cityOtherPlaceholder')}
              />
            )}
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
            <NativeSelect
              value={collegeIsOther ? OTHER_COLLEGE : (watch('itiCollege') ?? '')}
              onChange={(e) => {
                const value = e.target.value;
                if (value === OTHER_COLLEGE) {
                  setCollegeIsOther(true);
                  setValue('itiCollege', '');
                } else {
                  setCollegeIsOther(false);
                  setValue('itiCollege', value);
                }
              }}
            >
              <option value="">—</option>
              {ITI_COLLEGES.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
              <option value={OTHER_COLLEGE}>{t('fields.itiCollegeOther')}</option>
            </NativeSelect>
            {collegeIsOther && (
              <Input
                {...register('itiCollege')}
                className="mt-2"
                placeholder={t('fields.itiCollegeOtherPlaceholder')}
                autoComplete="off"
                aria-label={t('fields.itiCollegeOtherPlaceholder')}
              />
            )}
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
