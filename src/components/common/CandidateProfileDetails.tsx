import { useTranslation } from 'react-i18next';
import type { CandidateProfile } from '@/api/types';
import { formatExperience } from '@/lib/format';

/**
 * Full read-only candidate profile, shown to employers (in their applicant list)
 * and to admins.
 */
export function CandidateProfileDetails({ candidate }: { candidate: CandidateProfile }) {
  const { t } = useTranslation(['candidate', 'common']);
  const c = candidate;

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <Section title={t('candidate:profile.sections.basic')}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Item label={t('candidate:fields.phone')} value={c.phone} href={c.phone ? `tel:${c.phone}` : undefined} />
            <Item label={t('candidate:fields.email')} value={c.email} href={c.email ? `mailto:${c.email}` : undefined} />
            <Item
              label={t('candidate:fields.gender')}
              value={c.gender ? t(`candidate:fields.genderOptions.${c.gender}`) : null}
            />
          </dl>
          {c.description && (
            <div className="mt-2">
              <dt className="text-xs text-content-muted">{t('candidate:fields.description')}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-sm">{c.description}</dd>
            </div>
          )}
        </Section>

        <Section title={t('candidate:profile.sections.education')}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Item label={t('candidate:fields.highestEducation')} value={c.highestEducation} />
            <Item label={t('candidate:fields.itiTrade')} value={c.itiTrade} />
            <Item label={t('candidate:fields.itiCollege')} value={c.itiCollege} />
            <Item label={t('candidate:fields.department')} value={c.department} />
            <Item label={t('candidate:fields.graduationYear')} value={c.graduationYear?.toString()} />
          </dl>
          {c.skills && c.skills.length > 0 && (
            <div className="mt-2">
              <dt className="text-xs text-content-muted">{t('candidate:fields.skills')}</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </Section>

        {c.workExperiences && c.workExperiences.length > 0 && (
          <Section title={t('candidate:profile.sections.workHistory')}>
            <ul className="flex flex-col gap-3">
              {c.workExperiences.map((w, i) => (
                <li key={i} className="text-sm">
                  <div className="font-medium">
                    {[w.role, w.company].filter(Boolean).join(' · ')}
                  </div>
                  {(w.fromMonth || w.toMonth || w.current) && (
                    <div className="text-xs text-content-muted">
                      {[w.fromMonth, w.current ? t('candidate:fields.workExp.present') : w.toMonth]
                        .filter(Boolean)
                        .join(' – ')}
                    </div>
                  )}
                  {w.description && <div className="mt-0.5 whitespace-pre-line">{w.description}</div>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {c.educations && c.educations.length > 0 && (
          <Section title={t('candidate:profile.sections.educationHistory')}>
            <ul className="flex flex-col gap-2">
              {c.educations.map((ed, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">
                    {[ed.degree, ed.field].filter(Boolean).join(', ')}
                  </span>
                  {ed.institution && <span> — {ed.institution}</span>}
                  {ed.year && <span className="text-content-muted"> ({ed.year})</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title={t('candidate:profile.sections.preferences')}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Item
              label={t('candidate:fields.workExperienceMonths')}
              value={formatExperience(c.workExperienceMonths)}
            />
            <Item
              label={t('candidate:fields.address')}
              value={[c.city, c.district, c.pincode].filter(Boolean).join(', ') || null}
            />
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-bold text-content">{title}</h3>
      {children}
    </div>
  );
}

function Item({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null;
  href?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="break-words text-sm font-medium">
        {value ? (
          href ? (
            <a href={href} className="text-brand-700 hover:underline">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          '—'
        )}
      </dd>
    </div>
  );
}
