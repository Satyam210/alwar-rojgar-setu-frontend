import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminCandidates } from './queries';
import { ITI_DEPARTMENTS, PAGE_SIZE } from '@/lib/constants';
import { formatCurrency, formatExperience } from '@/lib/format';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';

export function AdminCandidatesPage() {
  const { t } = useTranslation(['admin', 'candidate']);
  usePageTitle(t('admin:candidates.title'));

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminCandidates({
    search: search || undefined,
    department: department || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1>{t('admin:candidates.title')}</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-64">
          <Field label={t('admin:candidates.search')}>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <div className="w-64">
          <Field label={t('admin:candidates.filterDepartment')}>
            <NativeSelect
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t('admin:candidates.allDepartments')}</option>
              {ITI_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && data.data.length === 0 && <EmptyState title={t('admin:candidates.empty')} />}

      {data && data.data.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.data.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardBody>
                    <h2 className="text-base font-semibold">{c.fullName}</h2>
                    <p className="text-sm text-content-muted">
                      {[c.itiTrade, c.highestEducation, c.district].filter(Boolean).join(' · ') ||
                        '—'}
                    </p>
                    {(c.department || c.itiCollege) && (
                      <p className="text-sm text-content-muted">
                        {[c.department, c.itiCollege].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-content-muted">
                      {t('candidate:fields.workExperienceMonths')}:{' '}
                      {formatExperience(c.workExperienceMonths)}
                      {c.expectedSalary
                        ? ` · ${t('candidate:fields.expectedSalary')}: ${formatCurrency(c.expectedSalary)}`
                        : ''}
                    </p>
                    {c.email && (
                      <p className="text-sm">
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                      </p>
                    )}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
