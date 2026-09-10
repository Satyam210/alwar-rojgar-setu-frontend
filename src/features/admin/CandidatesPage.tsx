import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminCandidates } from './queries';
import { getAdminCandidates } from '@/api/admin';
import { ITI_TRADES, PAGE_SIZE } from '@/lib/constants';
import { formatExperience, formatDate } from '@/lib/format';
import { downloadCsv, stampedFilename, type CsvColumn } from '@/lib/export';
import { apiErrorMessage } from '@/lib/errors';
import type { CandidateProfile } from '@/api/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function AdminCandidatesPage() {
  const { t } = useTranslation(['admin', 'candidate']);
  usePageTitle(t('admin:candidates.title'));

  const [search, setSearch] = useState('');
  const [trade, setTrade] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, refetch } = useAdminCandidates({
    search: search || undefined,
    trade: trade || undefined,
    page,
    limit: PAGE_SIZE,
  });

  async function handleExport() {
    setExporting(true);
    try {
      // Export the full filtered set, not just the current page.
      const all = await getAdminCandidates({
        search: search || undefined,
        trade: trade || undefined,
        page: 1,
        limit: 1000,
      });
      const columns: CsvColumn<CandidateProfile>[] = [
        { header: 'Full Name', value: (c) => c.fullName },
        { header: 'Gender', value: (c) => c.gender },
        { header: 'Phone', value: (c) => c.phone },
        { header: 'Email', value: (c) => c.email },
        { header: 'ITI Trade', value: (c) => c.itiTrade },
        { header: 'Highest Education', value: (c) => c.highestEducation },
        { header: 'Department', value: (c) => c.department },
        { header: 'ITI College', value: (c) => c.itiCollege },
        { header: 'District', value: (c) => c.district },
        { header: 'City', value: (c) => c.city },
        { header: 'Experience (months)', value: (c) => c.workExperienceMonths },
        { header: 'About', value: (c) => c.description },
        { header: 'Skills', value: (c) => c.skills?.join('; ') },
        { header: 'Registered On', value: (c) => formatDate(c.createdAt) },
      ];
      downloadCsv(stampedFilename('candidates'), all.data, columns);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>{t('admin:candidates.title')}</h1>
        <Button
          variant="secondary"
          onClick={handleExport}
          loading={exporting}
          disabled={!data || data.total === 0}
        >
          {t('admin:candidates.download')}
        </Button>
      </div>

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
          <Field label={t('admin:candidates.filterTrade')}>
            <NativeSelect
              value={trade}
              onChange={(e) => {
                setTrade(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t('admin:candidates.allTrades')}</option>
              {ITI_TRADES.map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
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
                      {[c.gender ? t(`candidate:fields.genderOptions.${c.gender}`) : null, c.itiTrade, c.highestEducation, c.district].filter(Boolean).join(' · ') ||
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
                    </p>
                    <p className="text-sm">
                      {c.phone && <a href={`tel:${c.phone}`}>{c.phone}</a>}
                      {c.phone && c.email ? ' · ' : ''}
                      {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                    </p>
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
