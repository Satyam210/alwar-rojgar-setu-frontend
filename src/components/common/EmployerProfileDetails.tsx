import { useTranslation } from 'react-i18next';
import type { EmployerProfile } from '@/api/types';
import { formatDate } from '@/lib/format';

/** Full read-only employer profile, shown to admins. */
export function EmployerProfileDetails({ employer }: { employer: EmployerProfile }) {
  const { t } = useTranslation(['employer', 'admin']);
  const e = employer;

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <Section title={t('employer:sections.company')}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Item label={t('employer:fields.gstNumber')} value={e.gstNumber} />
            <Item label={t('employer:fields.udyamNumber')} value={e.udyamNumber} />
            <Item label={t('employer:fields.status')} value={t(`employer:verification.${e.status}`)} />
            <Item label={t('admin:employers.registeredOn')} value={formatDate(e.createdAt)} />
          </dl>
          {e.description && (
            <div className="mt-2">
              <dt className="text-xs text-content-muted">{t('employer:fields.companyDescription')}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-sm">{e.description}</dd>
            </div>
          )}
        </Section>

        <Section title={t('employer:fields.contactPersonSection')}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Item label={t('employer:fields.contactPersonName')} value={e.contactPersonName} />
            <Item label={t('employer:fields.contactPersonDesignation')} value={e.contactPersonDesignation} />
            <Item
              label={t('employer:fields.contactPersonPhone')}
              value={e.contactPersonPhone}
              href={e.contactPersonPhone ? `tel:${e.contactPersonPhone}` : undefined}
            />
            <Item
              label={t('employer:fields.contactPersonEmail')}
              value={e.contactPersonEmail}
              href={e.contactPersonEmail ? `mailto:${e.contactPersonEmail}` : undefined}
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

function Item({ label, value, href }: { label: string; value?: string | null; href?: string }) {
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
